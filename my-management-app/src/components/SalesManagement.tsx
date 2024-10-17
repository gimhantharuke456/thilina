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
  getAllSales,
  createSale,
  updateSale,
  deleteSale,
} from "../api/saleService";
import { getAllProducts } from "../api/productService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Sale, SaleSchema, SaleType } from "../models/SaleModel";
import { Product } from "../models/ProductModel";
import moment from "moment";

const { Option } = Select;
const { Search } = Input;

const SalesManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Sale | null>(null);

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await getAllSales();
      setSales(response);
      setFilteredSales(response);
    } catch (error) {
      message.error("Failed to load sales.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts();
      setProducts(response);
    } catch (error) {
      message.error("Failed to load products.");
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const sale: SaleType = {
        productId: values.productId,
        volume: parseInt(values.volume),
        totalSalePrice: parseFloat(values.totalSalePrice),
        paymentMethod: values.paymentMethod,
        date: values.date.toDate(),
      };

      SaleSchema.parse(sale);

      if (editingRecord) {
        await updateSale(editingRecord._id, sale);
        message.success("Sale updated successfully!");
      } else {
        await createSale(sale);
        message.success("Sale created successfully!");
      }

      form.resetFields();
      fetchSales();
      setEditingRecord(null);
      setModalOpened(false);
    } catch (error: any) {
      if (error instanceof Error) {
        message.error(`Failed to save sale: ${error.message}`);
      } else {
        message.error("Failed to save sale due to an unknown error.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: Sale) => {
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
      await deleteSale(id);
      message.success("Sale deleted successfully!");
      fetchSales();
    } catch (error) {
      message.error("Failed to delete sale.");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Product",
      "Volume",
      "Total Sale Price",
      "Payment Method",
      "Date",
    ];
    const tableRows = filteredSales.map((sale) => [
      products.find((p) => p._id === sale.productId)?.name || "Unknown",
      sale.volume,
      sale.totalSalePrice,
      sale.paymentMethod,
      new Date(sale.date).toLocaleDateString(),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.text("Sales Report", 14, 15);
    doc.save("sales_report.pdf");
  };

  const handleSearch = (value: string) => {
    const filtered = sales.filter((sale) =>
      products
        .find((p) => p._id === sale.productId)
        ?.name.toLowerCase()
        .includes(value.toLowerCase())
    );
    setFilteredSales(filtered);
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "productId",
      key: "productId",
      render: (productId: string) =>
        products.find((p) => p._id === productId)?.name || "Unknown",
    },
    { title: "Volume", dataIndex: "volume", key: "volume" },
    {
      title: "Total Sale Price",
      dataIndex: "totalSalePrice",
      key: "totalSalePrice",
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      render: (text: any, record: Sale) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
          />
          <Popconfirm
            title="Are you sure you want to delete this sale?"
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
    <Spin spinning={loading}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Search
          placeholder="Search by product name"
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
            Create Sale
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
      <Table columns={columns} dataSource={filteredSales} rowKey="_id" />
      <Modal
        title={editingRecord ? "Edit Sale" : "Create Sale"}
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
            name="productId"
            label="Product"
            rules={[{ required: true, message: "Please select a product!" }]}
          >
            <Select>
              {products.map((product) => (
                <Option key={product._id} value={product._id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="volume"
            label="Volume"
            rules={[{ required: true, message: "Please input the volume!" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="totalSalePrice"
            label="Total Sale Price"
            rules={[
              { required: true, message: "Please input the total sale price!" },
            ]}
          >
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item
            name="paymentMethod"
            label="Payment Method"
            rules={[
              { required: true, message: "Please select a payment method!" },
            ]}
          >
            <Select>
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select the sale date!" }]}
          >
            <DatePicker
              disabledDate={(current) => {
                // Disable past dates
                return current && current < moment().startOf('day');
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingRecord ? "Update Sale" : "Create Sale"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default SalesManagement;
