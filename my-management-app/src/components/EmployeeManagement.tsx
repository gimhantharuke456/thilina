import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Table,
  Popconfirm,
  message,
  Spin,
  Modal,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../api/employeeService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Employee, EmployeeSchema, EmployeeType } from "../models/EmpoyeeModel";

const { Search } = Input;

const EmployeeManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await getAllEmployees();
      setEmployees(response);
      setFilteredEmployees(response);
    } catch (error) {
      message.error("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const employee: EmployeeType = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        nicNumber: values.nic,
        address: values.address,
      };

      EmployeeSchema.parse(employee);

      if (editingRecord) {
        await updateEmployee(editingRecord._id, employee);
        message.success("Employee updated successfully!");
      } else {
        await createEmployee(employee);
        message.success("Employee created successfully!");
      }

      form.resetFields();
      fetchEmployees();
      setEditingRecord(null);
      setModalOpened(false);
    } catch (error: any) {
      if (error instanceof Error) {
        message.error(`Failed to save employee: ${error.message}`);
      } else {
        message.error("Failed to save employee due to an unknown error.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: Employee) => {
    form.setFieldsValue({
      ...record,
      nic: record.nicNumber,
    });
    setEditingRecord(record);
    setModalOpened(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteEmployee(id);
      message.success("Employee deleted successfully!");
      fetchEmployees();
    } catch (error) {
      message.error("Failed to delete employee.");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const doc = new jsPDF();
    const tableColumn = ["Name", "Email", "Phone", "NIC"];
    const tableRows = filteredEmployees.map((employee) => [
      employee.name,
      employee.email,
      employee.phone,
      employee.nicNumber,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.text("Employee Report", 14, 15);
    doc.save("employee_report.pdf");
  };

  const handleSearch = (value: string) => {
    const filtered = employees.filter((employee) =>
      employee.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: Employee, b: Employee) => a.name.localeCompare(b.name),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "NIC Number",
      dataIndex: "nicNumber",
      key: "nicNumber",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "addres",
    },
    {
      title: "Action",
      key: "action",
      render: (text: any, record: Employee) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
          />
          <Popconfirm
            title="Are you sure you want to delete this employee?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} type="link" danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (

    <div style={styles.container}>
    <Spin spinning={loading}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Search
          placeholder="Search by name"
          onSearch={handleSearch}
          style={{ width: 200 }}
        />
        <div>
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRecord(null);
              form.resetFields();
              setModalOpened(true);
            }}
            style={{ marginRight: 8 }}
          >
            Create Employee
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={generateReport}
            type="primary"
          >
            Generate Report
          </Button>
        </div>
      </div>
      <Table columns={columns} dataSource={filteredEmployees} rowKey="_id" />
      <Modal
        title={editingRecord ? "Edit Employee" : "Create Employee"}
        open={modalOpened}
        onCancel={() => setModalOpened(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: "Please input the employee's name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please input the email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "Please input the phone number!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="nic"
            label="NIC Number"
            rules={[
              { required: true, message: "Please input the nic number!" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="address"
            label="address"
            rules={[
              {
                required: true,
                message: "Please select the  address!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingRecord ? "Update Employee" : "Create Employee"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
    </div>
  );
};

export default EmployeeManagement;

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundImage: 'url("/bg-3.jpg")', // Replace with actual image link
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
}