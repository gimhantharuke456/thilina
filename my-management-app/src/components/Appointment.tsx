import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
} from "antd";
import { AppointmentType } from "../models/Appointment";
import {
  getAllAppointments,
  updateAppointment,
  deleteAppointment,
} from "../api/appointmentService";
import {
  EditOutlined,
  DeleteOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";

const { Option } = Select;

const Appointment = () => {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState(""); // State for search
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const data = await getAllAppointments();
      setAppointments(data);
    } catch (error) {
      message.error("Error fetching appointments");
    }
  };

  // Handle Edit button click
  const handleEdit = (appointment: AppointmentType) => {
    setEditingAppointment(appointment);
    setIsModalVisible(true);
    form.setFieldsValue({
      serviceType: appointment.serviceType,
      status: appointment.status,
      price: appointment.price,
    });
  };

  // Handle form submission for updating
  const handleUpdate = async () => {
    try {
      const updatedValues = await form.validateFields();
      await updateAppointment(editingAppointment?._id! || "", {
        ...updatedValues,
        price: parseFloat(updatedValues.price),
      });
      message.success("Appointment updated successfully!");
      setIsModalVisible(false);
      fetchAppointments();
    } catch (error) {
      message.error("Error updating appointment");
    }
  };

  // Handle delete appointment
  const handleDelete = async (id: string) => {
    try {
      await deleteAppointment(id);
      message.success("Appointment deleted successfully!");
      fetchAppointments();
    } catch (error) {
      message.error("Error deleting appointment");
    }
  };

  // Handle search
  const filteredAppointments = appointments.filter((appointment) =>
    appointment.carNumber.toLowerCase().includes(searchText.toLowerCase())
  );

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Appointments Report", 20, 10);

    const tableColumn = [
      "Car Number",
      "Car Type",
      "Vehicle Type",
      "Payment Method",
      "Date",
      "Time",
      "Slot Number",
      "Service Type",
      "Status",
      "Price",
    ];

    const tableRows = appointments.map((appointment) => [
      appointment.carNumber,
      appointment.carType,
      appointment.vehicleType,
      appointment.paymentMethod,
      appointment.date,
      appointment.time,
      appointment.slotNumber,
      appointment.serviceType,
      appointment.status,
      appointment.price,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("appointments_report.pdf");
  };

  const columns = [
    {
      title: "Car Type",
      dataIndex: "carType",
      key: "carType",
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicleType",
      key: "vehicleType",
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
      render: (date: any) => {
        return moment(date).format("YYYY-MM-DD");
      },
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      render: (time: any) => {
        return moment(time, "HH:mm").format("HH:mm");
      },
    },
    {
      title: "Slot Number",
      dataIndex: "slotNumber",
      key: "slotNumber",
    },
    {
      title: "Car Number",
      dataIndex: "carNumber",
      key: "carNumber",
    },
    {
      title: "Service Type",
      dataIndex: "serviceType",
      key: "serviceType",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text: any, record: AppointmentType) => (
        <>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => handleEdit(record)}
          ></Button>
          <Popconfirm
            title="Are you sure to delete this appointment?"
            onConfirm={() => handleDelete(record._id!)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} type="link" danger></Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div
    style={{
      backgroundImage: 'url("bg-7.jpg")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      minHeight: "100vh", // Adjust this to fit the height
      padding: "20px",
    }}>
      <Input
        placeholder="Search by car number"
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 20, width: "300px" }}
      />
      <Button
        onClick={generatePDF}
        type="primary"
        icon={<FilePdfOutlined />}
        style={{ marginBottom: 20 }}
      >
        Generate PDF
      </Button>
      <Table dataSource={filteredAppointments} columns={columns} rowKey="_id" />

      {/* Modal for updating appointment */}
      <Modal
        title="Update Appointment"
        visible={isModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Service Type"
            name="serviceType"
            rules={[
              { required: true, message: "Please select a service type" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select>
              <Option value="accept">Accept</Option>
              <Option value="reject">Reject</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please enter the price" }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Appointment;
