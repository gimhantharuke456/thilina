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
  Select ,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/productService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Product, ProductSchema, ProductType } from "../models/ProductModel";
import moment from "moment";

const { Search } = Input;

const ProductManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Product | null>(null);
  const { Option } = Select;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getAllProducts();
      setProducts(response);
      setFilteredProducts(response);
    } catch (error) {
      message.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const product: ProductType = {
        name: values.name,
        category: values.category,
        quantity: parseInt(values.quantity),
        pricePerUnit: parseFloat(values.pricePerUnit),
        lastRestockDate: values.lastRestockDate.toDate(),
      };

      ProductSchema.parse(product);

      if (editingRecord) {
        await updateProduct(editingRecord._id, product);
        message.success("Product updated successfully!");
      } else {
        await createProduct(product);
        message.success("Product created successfully!");
      }

      form.resetFields();
      fetchProducts();
      setEditingRecord(null);
      setModalOpened(false);
    } catch (error: any) {
      if (error instanceof Error) {
        message.error(`Failed to save product: ${error.message}`);
      } else {
        message.error("Failed to save product due to an unknown error.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: Product) => {
    form.setFieldsValue({
      ...record,
      lastRestockDate: moment(record.lastRestockDate),
    });
    setEditingRecord(record);
    setModalOpened(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteProduct(id);
      message.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      message.error("Failed to delete product.");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Name",
      "Category",
      "Quantity",
      "Price Per Unit",
      "Last Restock Date",
    ];
    const tableRows = filteredProducts.map((product) => [
      product.name,
      product.category,
      product.quantity,
      product.pricePerUnit,
      new Date(product.lastRestockDate).toLocaleDateString(),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.text("Product Report", 14, 15);
    doc.save("product_report.pdf");
  };

  const handleSearch = (value: string) => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Price Per Unit", dataIndex: "pricePerUnit", key: "pricePerUnit" },
    {
      title: "Last Restock Date",
      dataIndex: "lastRestockDate",
      key: "lastRestockDate",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      render: (text: any, record: Product) => (
        <span>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
          />
          <Popconfirm
            title="Are you sure you want to delete this product?"
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
            Create Product
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
      <Table columns={columns} dataSource={filteredProducts} rowKey="_id" />
      <Modal
        title={editingRecord ? "Edit Product" : "Create Product"}
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
              { required: true, message: "Please input the product name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select the product category!" }]}
          >
            <Select placeholder="Select a category">
              <Option value="Petrol">Petrol</Option>
              <Option value="Diesel">Diesel</Option>
              <Option value="Lubricants">Lubricants</Option>
              <Option value="Kerosene">Kerosene</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Volume & Quantity"
            rules={[{ required: true, message: "Please input the quantity!" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="pricePerUnit"
            label="Price Per Unit"
            rules={[
              { required: true, message: "Please input the price per unit!" },
            ]}
          >
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item
            name="lastRestockDate"
            label="Last Restock Date"
            rules={[
              {
                required: true,
                message: "Please select the last restock date!",
              },
            ]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingRecord ? "Update Product" : "Create Product"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default ProductManagement;
