import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Table, Popconfirm, message, Spin, Modal } from 'antd';
import {
  getAllServiceTypes,
  createServiceType,
  updateServiceType,
  deleteServiceType,
} from '../api/serviceTypeService';
import { ServiceType } from '../models/ServiceTypeModel';

const ServiceTypeManager: React.FC = () => {
  const [form] = Form.useForm();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceType | null>(null);

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const fetchServiceTypes = async () => {
    setLoading(true);
    try {
      const response = await getAllServiceTypes();
      setServiceTypes(response);
    } catch (error) {
      message.error('Failed to load service types.');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: ServiceType) => {
    setLoading(true);
    try {
      // Ensure price is a positive number
      const formattedValues = {
        ...values,
        price: parseFloat(values.price.toString()), // Ensure it's a number
      };
  
      if (editingRecord) {
        if (!editingRecord._id) {
          throw new Error('Editing record ID is missing.');
        }
        await updateServiceType(editingRecord._id!, formattedValues);
        message.success('Service type updated successfully!');
      } else {
        await createServiceType(formattedValues);
        message.success('Service type created successfully!');
      }
  
      form.resetFields();
      fetchServiceTypes();
      setEditingRecord(null);
      setModalOpened(false);
    } catch (error: any) {
      console.error('Error details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      message.error(`Failed to save service type: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  

  const handleEdit = (record: ServiceType) => {
    form.setFieldsValue(record);
    setEditingRecord(record);
    setModalOpened(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteServiceType(id);
      message.success('Service type deleted successfully!');
      fetchServiceTypes();
    } catch (error) {
      message.error('Failed to delete service type.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (text: number) => `$${text.toFixed(2)}`, // Format price
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: ServiceType) => (
        <span>
          <Button onClick={() => handleEdit(record)} type="link">
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this service type?"
            onConfirm={() => handleDelete(record._id!)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div style={styles.container}>
    <Spin spinning={loading}>
      <Button onClick={() => setModalOpened(true)} type="primary" style={{ marginBottom: 16 }}>
        Create Service Type
      </Button>
      <Table columns={columns} dataSource={serviceTypes} rowKey="_id" />
      <Modal
        title={editingRecord ? 'Edit Service Type' : 'Create Service Type'}
        open={modalOpened}
        onCancel={() => setModalOpened(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Service Name"
            rules={[{ required: true, message: 'Please input the service name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please input the price!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingRecord ? 'Update Service Type' : 'Create Service Type'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
    </div>
  );
};

export default ServiceTypeManager;

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundImage: 'url("/bg-8.jpg")', // Replace with actual image link
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
}