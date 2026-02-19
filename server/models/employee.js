const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

// ok this is the main staff member model
class Employee extends Model {
  // ok helper to verify keys
  async checkPass(p) {
    return await bcrypt.compare(p, this.password);
  }
}

Employee.init({
  employeeNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  surname: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  birthDate: { type: DataTypes.DATEONLY, allowNull: false },
  salary: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false },
  permissionLevel: { type: DataTypes.ENUM('employee', 'manager', 'hr', 'admin'), defaultValue: 'employee' },
  password: { type: DataTypes.STRING, allowNull: false },
  managerId: { type: DataTypes.INTEGER, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  sequelize,
  modelName: 'Employee',
  tableName: 'employees',
  hooks: {
    // encrypt before saving
    beforeCreate: async (e) => {
      const salt = await bcrypt.genSalt(10);
      e.password = await bcrypt.hash(e.password, salt);
    },
    beforeUpdate: async (e) => {
      if (e.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        e.password = await bcrypt.hash(e.password, salt);
      }
    }
  }
});

// setup the links for the tree
Employee.belongsTo(Employee, { as: 'manager', foreignKey: 'managerId' });
Employee.hasMany(Employee, { as: 'subordinates', foreignKey: 'managerId' });

module.exports = Employee;
