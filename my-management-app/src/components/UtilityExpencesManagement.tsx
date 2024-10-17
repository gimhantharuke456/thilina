// src/components/UtilityExpensesManagement.tsx
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
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  getAllUtilityExpenses,
  createUtilityExpense,
  updateUtilityExpense,
  deleteUtilityExpense,
} from "../api/utilityExpenseService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  UtilityExpense,
  UtilityExpenseSchema,
  UtilityExpenseType,
} from "../models/UtilityExpenseModel";
import moment from "moment";

const { Search } = Input;

const UtilityExpensesManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [expenses, setExpenses] = useState<UtilityExpense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<UtilityExpense[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<UtilityExpense | null>(
    null
  );

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await getAllUtilityExpenses();
      setExpenses(response);
      setFilteredExpenses(response);
    } catch (error) {
      message.error("Failed to load utility expenses.");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const expense: UtilityExpenseType = {
        type: values.type,
        amount: parseFloat(values.amount),
        date: values.date.toDate(),
        description: values.description,
      };

      UtilityExpenseSchema.parse(expense);

      if (editingRecord) {
        await updateUtilityExpense(editingRecord._id, expense);
        message.success("Utility expense updated successfully!");
      } else {
        await createUtilityExpense(expense);
        message.success("Utility expense created successfully!");
      }

      form.resetFields();
      fetchExpenses();
      setEditingRecord(null);
      setModalOpened(false);
    } catch (error: any) {
      if (error instanceof Error) {
        message.error(`Failed to save utility expense: ${error.message}`);
      } else {
        message.error(
          "Failed to save utility expense due to an unknown error."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: UtilityExpense) => {
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
      await deleteUtilityExpense(id);
      message.success("Utility expense deleted successfully!");
      fetchExpenses();
    } catch (error) {
      message.error("Failed to delete utility expense.");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const doc = new jsPDF();
    const tableColumn = ["Type", "Amount", "Date", "Description"];
    const tableRows = filteredExpenses.map((expense) => [
      expense.type,
      expense.amount,
      new Date(expense.date).toLocaleDateString(),
      expense.description || "",
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.text("Utility Expenses Report", 14, 15);
    doc.save("utility_expenses_report.pdf");
  };

  const handleSearch = (value: string) => {
    const filtered = expenses.filter((expense) =>
      expense.type.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredExpenses(filtered);
  };

  const columns = [
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Action",
      key: "action",
      render: (text: any, record: UtilityExpense) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
          />
          <Popconfirm
            title="Are you sure you want to delete this utility expense?"
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
          placeholder="Search by type"
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
            Create Utility Expense
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
      <Table columns={columns} dataSource={filteredExpenses} rowKey="_id" />
      <Modal
        title={
          editingRecord ? "Edit Utility Expense" : "Create Utility Expense"
        }
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
            name="type"
            label="Type"
            rules={[
              { required: true, message: "Please input the expense type!" },
            ]}
          >
            <Select>
              <Select.Option value="Electricity">Electricity</Select.Option>
              <Select.Option value="Water">Water</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Please input the amount!" }]}
          >
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[
              {
                required: true,
                message: "Please select the date!",
              },
            ]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingRecord
                ? "Update Utility Expense"
                : "Create Utility Expense"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
    </div>
  );
};

export default UtilityExpensesManagement;

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundImage: 'url("/bg-6.jpg")', // Replace with actual image link
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
}