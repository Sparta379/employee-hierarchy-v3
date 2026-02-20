import { prisma } from '../../../lib/prisma';

export async function GET(request) {
  try {
    const assignedEmployeeNumbers = await prisma.reportingLineManager.findMany({
      select: {
        employee_id: true,
      },
      distinct: ['employee_id'],
    });

    const assignedManagerNumbers = await prisma.reportingLineManager.findMany({
      select: {
        manager_id: true,
      },
      distinct: ['manager_id'],
    });

    const allAssignedNumbers = [
      ...assignedEmployeeNumbers.map((a) => a.employee_id),
      ...assignedManagerNumbers.map((a) => a.manager_id),
    ];

    const notAssignedEmployees = await prisma.employee.findMany({
      where: {
        employee_number: {
          notIn: allAssignedNumbers,
        },
      },
      select: {
        employee_number: true,
        name: true,
        surname: true,
      },
    });

    if (notAssignedEmployees.length === 0) {
      return new Response(JSON.stringify({ message: 'No employees found without reporting lines' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(notAssignedEmployees), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Database error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
