import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAttendanceByEmployeeId } from "../api/employeeAttendanceService"; // Adjusted import
import { Card, Spin, Alert, Table, Typography, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { MonthPicker } = DatePicker;

interface AttendanceRecord {
  _id: string;
  employeeId: string;
  arrivalTime: string;
  departureTime: string;
  shiftType: string;
  createdAt: string;
}

const Attendance: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Grab the 'id' param from URL
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        if (id) { // Ensure id exists before fetching
          const data = await getAttendanceByEmployeeId(id);
          
          // Sort records by createdAt in descending order after fetching
          const sortedData = data.sort((a: AttendanceRecord, b: AttendanceRecord) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setAttendanceRecords(sortedData);
        } else {
          setError('No employee ID provided.');
        }
      } catch (err) {
        setError('Error fetching attendance records.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [id]);

  // Filter attendance records based on selected month
  const filterAndSortAttendance = () => {
    if (!selectedMonth) return attendanceRecords;

    const startOfMonth = selectedMonth.startOf('month').toISOString();
    const endOfMonth = selectedMonth.endOf('month').toISOString();

    const filteredRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.createdAt).toISOString();
      return recordDate >= startOfMonth && recordDate <= endOfMonth;
    });

    // Sort records by createdAt in descending order
    return filteredRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const filteredRecords = filterAndSortAttendance();
  const totalAttendanceCount = filteredRecords.length;

  if (loading) {
    return <Spin size="large" tip="Loading..." />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
    },
    {
      title: 'Arrival Time',
      dataIndex: 'arrivalTime',
      key: 'arrivalTime',
    },
    {
      title: 'Departure Time',
      dataIndex: 'departureTime',
      key: 'departureTime',
    },
    {
      title: 'Shift Type',
      dataIndex: 'shiftType',
      key: 'shiftType',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(), // Format the date as readable
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card title="Attendance Records" style={{ width: '100%' }}>
        <div style={{ marginBottom: '16px' }}>
          <MonthPicker 
            onChange={(date) => setSelectedMonth(date)} 
            placeholder="Select Month" 
            style={{ marginRight: '8px' }} 
          />
          <Button type="primary" onClick={() => { /* Function to generate report */ }}>
            Generate Report
          </Button>
        </div>
        
        {totalAttendanceCount > 0 ? (
          <>
            <Text strong>Total Attendance in Selected Month: {totalAttendanceCount}</Text>
            <Table
              dataSource={filteredRecords}
              columns={columns}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
            />
          </>
        ) : (
          <Alert message="No Attendance Records" description="No attendance records found." type="info" showIcon />
        )}
      </Card>
    </div>
  );
};

export default Attendance;
