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
  DatePicker,
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
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Salary, SalarySchema, SalaryType } from "../models/SalaryModel";
import moment from "moment";

const { Search } = Input;

const SalaryManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [filteredSalaries, setFilteredSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Salary | null>(null);

  useEffect(() => {
    fetchSalaries();
  }, []);

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

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const date: Date = values.date
        ? moment(values.date).toDate()
        : new Date();
      const salary: SalaryType = {
        name: values.name,
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
      date: moment(record.date),
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

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Base Pay", dataIndex: "basePay", key: "basePay" },
    { title: "Bonus", dataIndex: "bonus", key: "bonus" },
    { title: "Total Pay", dataIndex: "totalPay", key: "totalPay" },
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
      render: (text: any, record: Salary) => (
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
        </span>
      ),
    },
  ];

  return (
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
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Base Pay"
            name="basePay"
            rules={[{ required: true, message: "Please input the base pay!" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="Bonus"
            name="bonus"
            rules={[{ required: true, message: "Please input the bonus!" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="Work Days"
            name="workDays"
            rules={[{ required: true, message: "Please input the work days!" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please select the date!" }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[
              {
                required: true,
                message: "Please input the phone number!",
                pattern: /^\+?[1-9]\d{1,14}$/,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingRecord ? "Update Salary" : "Create Salary"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default SalaryManagement;
