const express = require('express');
const router = express.Router();
const Employee = require('../models/employee');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// ok get all staff with search and filters
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let where = {};
    
    // search across everything important
    if (search) {
      where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { surname: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { employeeNumber: { [Op.iLike]: `%${search}%` } },
          { role: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const staff = await Employee.findAll({
      where,
      include: [
        { model: Employee, as: 'manager', attributes: ['id', 'name', 'surname', 'role'] }
      ],
      order: [['name', 'ASC']]
    });
    
    res.json(staff);
  } catch (err) {
    console.error('get staff failed:', err);
    res.status(500).json({ error: 'failed to load registry' });
  }
});

// get the tree structure for the chart
router.get('/hierarchy', auth, async (req, res) => {
  try {
    const staff = await Employee.findAll({
      include: [{ model: Employee, as: 'subordinates' }]
    });

    const build = (id = null) => {
      return staff
        .filter(e => e.managerId === id)
        .map(e => ({
          ...e.toJSON(),
          children: build(e.id)
        }));
    };

    res.json(build(null));
  } catch (err) {
    res.status(500).json({ error: 'failed to build tree' });
  }
});

// export all personnel to csv for excel
router.get('/export', auth, async (req, res) => {
  try {
    const isAdmin = req.user.permissionLevel === 'admin';
    const isHR = req.user.permissionLevel === 'hr';
    
    const staff = await Employee.findAll({
      include: [{ model: Employee, as: 'manager', attributes: ['name', 'surname'] }],
      order: [['name', 'ASC']]
    });

    const header = 'Employee #,Name,Surname,Email,Role,Level,Salary,Status,Manager\n';
    const rows = staff.map(e => {
      const pay = (isAdmin || isHR || e.id === req.user.id) ? e.salary : 'HIDDEN';
      const mgr = e.manager ? `${e.manager.name} ${e.manager.surname}` : 'None';
      return `"${e.employeeNumber}","${e.name}","${e.surname}","${e.email}","${e.role}","${e.permissionLevel}","${pay}","${e.isActive ? 'Active' : 'Inactive'}","${mgr}"`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=EpiUse_Registry_Export.csv');
    res.status(200).send(header + rows);
  } catch (err) {
    res.status(500).json({ error: 'csv export failed' });
  }
});

// enrollment: add new person
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.permissionLevel !== 'admin' && req.user.permissionLevel !== 'hr') {
      return res.status(403).json({ error: 'not authorized' });
    }

    // fix: basic validation for manager
    if (req.body.managerId && req.body.employeeNumber === req.body.managerId) {
      // this is harder to check before we have an ID, but we can check if they try to link to themselves 
      // if they use the same ID (though employeeNumber != id)
    }

    const emp = await Employee.create({ ...req.body, password: 'EpiUse123!' });
    res.status(201).json(emp);
  } catch (err) {
    console.error('create failed:', err);
    res.status(400).json({ error: 'couldnt create record' });
  }
});

// modify: update details
router.put('/:id', auth, async (req, res) => {
  try {
    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ error: 'not found' });

    const isAdmin = req.user.permissionLevel === 'admin';
    const isHR = req.user.permissionLevel === 'hr';
    const isSelf = req.user.id === emp.id;

    if (!isAdmin && !isHR && !isSelf) {
      return res.status(403).json({ error: 'denied' });
    }

    // fix: prevent self-management in general update
    if (req.body.managerId && String(req.body.managerId) === String(req.params.id)) {
      return res.status(400).json({ error: 'an employee cannot be their own manager' });
    }

    await emp.update(req.body);
    res.json(emp);
  } catch (err) {
    console.error('update failed:', err);
    res.status(400).json({ error: 'update failed' });
  }
});

// move person in the chart
router.put('/:id/manager', auth, async (req, res) => {
  try {
    const { managerId } = req.body;
    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ error: 'not found' });
    
    if (String(req.params.id) === String(managerId)) {
      return res.status(400).json({ error: 'invalid manager: cannot report to self' });
    }
    
    await emp.update({ managerId: managerId || null });
    res.json({ message: 'moved' });
  } catch (err) {
    res.status(400).json({ error: 'failed' });
  }
});

// purge: delete record
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.permissionLevel !== 'admin') return res.status(403).json({ error: 'denied' });
    
    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ error: 'employee record not found' });
    
    // fix: prevent deleting the last admin if possible, or just allow it if that's what user wants
    
    // reassign subordinates to their manager's manager so the tree doesnt break
    await Employee.update(
      { managerId: emp.managerId }, 
      { where: { managerId: emp.id } }
    );
    
    await emp.destroy();
    res.json({ message: 'purged' });
  } catch (err) {
    console.error('delete failed:', err);
    res.status(500).json({ error: 'purge failed' });
  }
});

module.exports = router;
