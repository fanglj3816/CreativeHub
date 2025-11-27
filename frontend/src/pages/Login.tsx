import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import type { LoginRequest } from '../api/auth';
import './auth.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const response = await login(values);
      if (response.code === 0 && response.data?.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        message.success('登录成功');
        navigate('/');
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '登录失败，请检查网络连接';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h1 className="auth-title">欢迎回来</h1>
        <p className="auth-subtitle">登录您的 CreativeHub 账户</p>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
          size="large"
        >
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="your@email.com" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>

          <div className="auth-link">
            <span>还没有账号？</span>
            <button
              type="button"
              className="auth-link-button"
              onClick={() => navigate('/register')}
            >
              立即注册
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
