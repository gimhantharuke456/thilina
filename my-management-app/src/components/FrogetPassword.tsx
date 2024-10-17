import React, { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { checkEmailAndUpdatePassword } from "../api/userService"; // Adjust the import path as necessary
import { CSSProperties } from 'react';

const { Title } = Typography;

const UpdatePasswordForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    console.log(email, password);
    try {
      const user = await checkEmailAndUpdatePassword(email, password);
      console.log("Password updated successfully:", user);
      // Optionally clear the form or redirect
    } catch (error: any) {
      setError(error.response?.data?.message || "Error updating password");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <Title level={3} style={styles.title as CSSProperties}>
          Update Password
        </Title>
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          style={styles.form}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter your email!" }]}
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={styles.input}
            />
          </Form.Item>
          <Form.Item
            label="New Password"
            name="password"
            rules={[{ required: true, message: "Please enter a new password!" }]}
          >
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              style={styles.input}
            />
          </Form.Item>
          {error && <p style={styles.error}>{error}</p>}
          <Form.Item>
            <Button type="primary" htmlType="submit" block style={styles.button}>
              Update Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default UpdatePasswordForm;

// Inline styles
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundImage: 'url("/station-bg.jpg")', // Replace with actual image link
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  formWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent dark overlay
    padding: '30px',
    borderRadius: '10px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.3)',
  },
  title: {
    textAlign: 'center' as CSSProperties['textAlign'], // Explicitly type 'textAlign'
    color: '#fff',
  },
  form: {
    width: '100%',
  },
  input: {
    borderRadius: '5px',
    
  },
  button: {
    borderRadius: '5px',
  },
  error: {
    color: 'red',
  },
};
