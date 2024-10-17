import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
import {
  Form,
  Input,
  Button,
  Table,
  Popconfirm,
  message,
  Spin,
  Modal,
  DatePicker,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  getAllSalaries,
  createSalary,
  updateSalary,
  deleteSalary,
} from "../api/salaryService";
import { getAllEmployees } from "../api/employeeService"; // Assuming the API is in this file
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Salary, SalarySchema, SalaryType } from "../models/SalaryModel";
import dayjs, { Dayjs } from "dayjs";

const { Search } = Input;
const { Option } = Select;

const SalaryManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [filteredSalaries, setFilteredSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Salary | null>(null);
  const [employees, setEmployees] = useState<any[]>([]); // State to store employee list
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(null); // Month filter

  // Fetch salaries on component mount
  useEffect(() => {
    fetchSalaries();
  }, []);

  // Fetch employees and store in state
  useEffect(() => {
    fetchEmployees();
  }, []);

  const getTotalPaymentForMonth = () => {
    return filteredSalaries.reduce((total, salary) => {
      return total + salary.basePay + (salary.bonus * salary.workDays);
    }, 0).toFixed(2); // Returning total with 2 decimal points
  };

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const response = await getAllSalaries();
      setSalaries(response);
      setFilteredSalaries(response);
    } catch (error) {
      message.error("Failed to load salaries.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await getAllEmployees();
      setEmployees(response); // Store employee list
    } catch (error) {
      message.error("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const date: Date = values.date ? dayjs(values.date).toDate() : new Date();
      const salary: SalaryType = {
        name: values.name, // Use employee name from Select
        basePay: parseFloat(values.basePay),
        bonus: parseFloat(values.bonus),
        totalPay: parseFloat(values.basePay) + parseFloat(values.bonus),
        workDays: parseInt(values.workDays),
        date: date,
        phone: values.phone,
      };

      SalarySchema.parse(salary);

      if (editingRecord) {
        await updateSalary(editingRecord._id!, salary);
        message.success("Salary updated successfully!");
      } else {
        await createSalary(salary);
        message.success("Salary created successfully!");
      }

      form.resetFields();
      fetchSalaries();
      setEditingRecord(null);
      setModalOpened(false);
    } catch (error: any) {
      if (error instanceof Error) {
        message.error(`Failed to save salary: ${error.message}`);
      } else {
        message.error("Failed to save salary due to an unknown error.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: Salary) => {
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date),
    });
    setEditingRecord(record);
    setModalOpened(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteSalary(id);
      message.success("Salary deleted successfully!");
      fetchSalaries();
    } catch (error) {
      message.error("Failed to delete salary.");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Name",
      "Base Pay",
      "Bonus",
      "Total Pay",
      "Work Days",
      "Date",
      "Phone",
    ];
    const tableRows = filteredSalaries.map((salary) => [
      salary.name,
      salary.basePay,
      salary.bonus,
      salary.totalPay,
      salary.workDays,
      new Date(salary.date).toLocaleDateString(),
      salary.phone,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.text("Salary Report", 14, 15);
    doc.save("salary_report.pdf");
  };

  const handleSearch = (value: string) => {
    const filtered = salaries.filter((salary) =>
      salary.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSalaries(filtered);
  };

  const filterSalariesByMonth = (date: Dayjs | null) => {
    if (!date) {
      setFilteredSalaries(salaries); // If no date is selected, show all salaries
      return;
    }

    const filtered = salaries.filter((salary) => {
      const salaryDate = dayjs(salary.date);
      return (
        salaryDate.month() === date.month() && salaryDate.year() === date.year()
      );
    });

    setFilteredSalaries(filtered); // Set the filtered data to state
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => {
        const [name] = text.split('+');
        return name;
      },
    },
    { title: "Base Pay", dataIndex: "basePay", key: "basePay" },
    { title: "Bonus", dataIndex: "bonus", key: "bonus" },
    {
      title: "Total Pay",
      key: "totalPay",
      render: (text: any, record: Salary) => {
        const { basePay, bonus, workDays } = record;
        const totalPay = basePay + (bonus * workDays);
        return totalPay.toFixed(2); // Display total pay with 2 decimal points
      },
    },
    { title: "Work Days", dataIndex: "workDays", key: "workDays" },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Action",
      key: "action",
      render: (text: any, record: Salary) => {
        const [name, id] = record.name.split('+'); // Split the name+id and extract the id
        return (
          <span>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              type="link"
            />
            <Popconfirm
              title="Are you sure you want to delete this salary?"
              onConfirm={() => handleDelete(record._id!)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} type="link" danger />
            </Popconfirm>
            <Link to={`/ViewAttendance/${id}`}>
              <Button icon={<EyeOutlined />} type="link" />
                Attendance
            </Link>
          </span>
        );
      },
    }
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

        {/* Display total payment for the selected month */}
        <div style={{ fontSize: 12 }}>
          Total Payment Amount For Month Rs.
          <strong style={{ color: 'red' }}>
            {getTotalPaymentForMonth()}
          </strong>
        </div>

        {/* Month Picker for filtering salaries by month */}
        <DatePicker
          picker="month"
          onChange={(date) => {
            setSelectedMonth(date);
            filterSalariesByMonth(date);
          }}
          placeholder="Select month"
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
            Create Salary
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
      <Table columns={columns} dataSource={filteredSalaries} rowKey="_id" />
      <Modal
        title={editingRecord ? "Edit Salary" : "Create Salary"}
        width={1200}
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
          {/* Select Employee */}
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please select an employee!" }]}
          >
            <Select
              placeholder="Select an employee"
              disabled={!!editingRecord} // Disable the field if editingRecord exists
            >
              {employees.map((employee) => (
                <Option
                  key={employee._id}
                  value={`${employee.name}+${employee._id}`}
                >
                  {employee.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Other form fields */}
          <Form.Item
            label="Base Pay"
            name="basePay"
            rules={[{ required: true, message: "Please select the base pay!" }]}
          >
            <Select placeholder="Select base pay">
              {Array.from({ length: 19 }, (_, i) => 10000 + i * 5000).map((value) => (
                <Select.Option key={value} value={value}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Bonus"
            name="bonus"
            rules={[{ required: true, message: "Please enter bonus!" }]}
          >
            <Select placeholder="Select bonus">
              {Array.from({ length: 10 }, (_, i) => 10 + i * 10).map((value) => (
                <Select.Option key={value} value={value}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Work Days"
            name="workDays"
            rules={[{ required: true, message: "Please enter work days!" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please select a date!" }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: "Please enter phone!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingRecord ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

    </Spin>
    </div>
  );
};

export default SalaryManagement;

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundImage: 'url("/bg-5.jpg")', // Replace with actual image link
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
}
