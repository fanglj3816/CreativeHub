import { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, register } from '../api/auth';
import type { LoginRequest, RegisterRequest } from '../api/auth';
import AuthIllustration from '../components/AuthIllustration';
import AddressSelector from '../components/AddressSelector';
import './auth.css';

const AuthPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const navigate = useNavigate();

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  // 根据路由路径自动切换模式，并重置表单
  useEffect(() => {
    const isLoginPage = location.pathname === '/login';
    setIsLogin(isLoginPage);
    
    // 重置表单 - 使用 setTimeout 确保在 DOM 渲染后执行
    setTimeout(() => {
      loginForm.resetFields();
      registerForm.resetFields();
      
      // 清除所有输入框的 focused 状态
      const inputWrappers = document.querySelectorAll('.input-wrapper');
      inputWrappers.forEach((wrapper) => {
        wrapper.classList.remove('focused');
        // 确保密码输入框内的输入框也被重置
        const passwordInput = wrapper.querySelector('.ant-input-password .ant-input') as HTMLInputElement;
        if (passwordInput) {
          passwordInput.value = '';
          passwordInput.blur();
        }
      });
      
      // 强制清除所有输入框的值
      const inputs = document.querySelectorAll('input');
      inputs.forEach((input) => {
        if (input.type !== 'submit' && input.type !== 'button') {
          input.value = '';
          // 触发 input 事件以确保 React 状态更新
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set;
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(input, '');
          }
          // 触发事件
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
          input.blur();
        }
      });
    }, 100);
  }, [location.pathname, loginForm, registerForm]);

  const handleLogin = async (values: LoginRequest) => {
    setLoginLoading(true);
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
      setLoginLoading(false);
    }
  };

  const handleRegister = async (values: RegisterRequest) => {
    setRegisterLoading(true);
    try {
      const response = await register(values);
      if (response.code === 0) {
        message.success('注册成功，请登录');
        setIsLogin(true);
        navigate('/login');
        registerForm.resetFields();
      } else {
        message.error(response.message || '注册失败');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '注册失败，请检查网络连接';
      message.error(errorMessage);
    } finally {
      setRegisterLoading(false);
    }
  };

  const switchToRegister = () => {
    setIsLogin(false);
    navigate('/register');
    loginForm.resetFields();
  };

  const switchToLogin = () => {
    setIsLogin(true);
    navigate('/login');
    registerForm.resetFields();
  };

  return (
    <div className="auth-container">
      <div className={`auth-box ${isLogin ? 'login-active' : 'register-active'}`}>
        {/* 装饰区域 */}
        <div className={`auth-decoration ${isLogin ? 'decoration-right' : 'decoration-left'}`}>
          <div className="decoration-content">
            <h2 className="decoration-title">
              {isLogin ? '欢迎回来' : '加入我们'}
            </h2>
            <p className="decoration-subtitle">
              {isLogin 
                ? '探索无限创意，分享你的音乐与摄影作品' 
                : '开启创意之旅，与全球创作者一起分享精彩瞬间'}
            </p>
            <div className="decoration-illustration">
              <AuthIllustration />
            </div>
            <div className="decoration-features">
              <div className="feature-item">
                <div className="feature-icon">🎵</div>
                <span className="feature-text">音乐创作</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📷</div>
                <span className="feature-text">摄影分享</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✨</div>
                <span className="feature-text">创意社区</span>
              </div>
            </div>
          </div>
        </div>

        {/* 登录表单 */}
        <div className="auth-form login-form">
          <div className="form-content">
            <h2 className="form-title">用户登录</h2>
            
            <Form
              form={loginForm}
              name="login"
              onFinish={handleLogin}
              layout="vertical"
              autoComplete="off"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <div className="input-wrapper" id="login-email-wrapper">
                  <Input 
                    className="form-input"
                    id="login-email-input"
                    defaultValue=""
                    onFocus={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      if (wrapper) {
                        wrapper.classList.add('focused');
                      }
                    }}
                    onBlur={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      if (wrapper && !e.target.value?.trim()) {
                        wrapper.classList.remove('focused');
                      }
                    }}
                    onChange={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      if (wrapper) {
                        if (e.target.value && e.target.value.trim()) {
                          wrapper.classList.add('focused');
                        } else if (document.activeElement !== e.target) {
                          wrapper.classList.remove('focused');
                        }
                      }
                    }}
                  />
                  <label className="input-label" htmlFor="login-email-input">用户名</label>
                </div>
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <div className="input-wrapper" id="login-password-wrapper">
                  <Input.Password 
                    className="form-input"
                    id="login-password-input"
                    defaultValue=""
                    onFocus={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      if (wrapper) {
                        wrapper.classList.add('focused');
                      }
                    }}
                    onBlur={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      const input = e.target.closest('.ant-input-password')?.querySelector('.ant-input') as HTMLInputElement;
                      if (wrapper && !input?.value?.trim()) {
                        wrapper.classList.remove('focused');
                      }
                    }}
                    onChange={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      const input = e.target.closest('.ant-input-password')?.querySelector('.ant-input') as HTMLInputElement;
                      if (wrapper) {
                        if (input?.value && input.value.trim()) {
                          wrapper.classList.add('focused');
                        } else if (document.activeElement !== input) {
                          wrapper.classList.remove('focused');
                        }
                      }
                    }}
                  />
                  <label className="input-label" htmlFor="login-password-input">密码</label>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loginLoading}
                  block
                  className="submit-btn"
                >
                  <span className="btn-text">登录</span>
                </Button>
              </Form.Item>
            </Form>

            <div className="form-footer">
              <span>还没有账号？</span>
              <button type="button" className="switch-btn" onClick={switchToRegister}>
                立即注册
              </button>
            </div>
          </div>
        </div>

        {/* 注册表单 */}
        <div className="auth-form register-form">
          <div className="form-content">
            <h2 className="form-title">用户注册</h2>
            
            <Form
              form={registerForm}
              name="register"
              onFinish={handleRegister}
              layout="vertical"
              autoComplete="off"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <div className="input-wrapper" id="register-email-wrapper">
                  <Input 
                    className="form-input"
                    id="register-email-input"
                    defaultValue=""
                    onFocus={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      if (wrapper) {
                        wrapper.classList.add('focused');
                      }
                    }}
                    onBlur={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      if (wrapper && !e.target.value?.trim()) {
                        wrapper.classList.remove('focused');
                      }
                    }}
                    onChange={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      if (wrapper) {
                        if (e.target.value && e.target.value.trim()) {
                          wrapper.classList.add('focused');
                        } else if (document.activeElement !== e.target) {
                          wrapper.classList.remove('focused');
                        }
                      }
                    }}
                  />
                  <label className="input-label" htmlFor="register-email-input">邮箱</label>
                </div>
              </Form.Item>

              <Form.Item
                name="nickname"
                rules={[
                  { required: true, message: '请输入昵称' },
                  { min: 2, message: '昵称至少2个字符' },
                ]}
              >
                <div className="input-wrapper" id="register-nickname-wrapper">
                  <Input 
                    className="form-input"
                    id="register-nickname-input"
                    defaultValue=""
                    onFocus={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      if (wrapper) {
                        wrapper.classList.add('focused');
                      }
                    }}
                    onBlur={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      if (wrapper && !e.target.value?.trim()) {
                        wrapper.classList.remove('focused');
                      }
                    }}
                    onChange={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      if (wrapper) {
                        if (e.target.value && e.target.value.trim()) {
                          wrapper.classList.add('focused');
                        } else if (document.activeElement !== e.target) {
                          wrapper.classList.remove('focused');
                        }
                      }
                    }}
                  />
                  <label className="input-label" htmlFor="register-nickname-input">昵称</label>
                </div>
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <div className="input-wrapper" id="register-password-wrapper">
                  <Input.Password 
                    className="form-input"
                    id="register-password-input"
                    defaultValue=""
                    onFocus={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      if (wrapper) {
                        wrapper.classList.add('focused');
                      }
                    }}
                    onBlur={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      const input = e.target.closest('.ant-input-password')?.querySelector('.ant-input') as HTMLInputElement;
                      if (wrapper && !input?.value?.trim()) {
                        wrapper.classList.remove('focused');
                      }
                    }}
                    onChange={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      const input = e.target.closest('.ant-input-password')?.querySelector('.ant-input') as HTMLInputElement;
                      if (wrapper) {
                        if (input?.value && input.value.trim()) {
                          wrapper.classList.add('focused');
                        } else if (document.activeElement !== input) {
                          wrapper.classList.remove('focused');
                        }
                      }
                    }}
                  />
                  <label className="input-label" htmlFor="register-password-input">密码</label>
                </div>
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <div className="input-wrapper" id="register-confirm-password-wrapper">
                  <Input.Password 
                    className="form-input"
                    id="register-confirm-password-input"
                    defaultValue=""
                    onFocus={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      if (wrapper) {
                        wrapper.classList.add('focused');
                      }
                    }}
                    onBlur={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      const input = e.target.closest('.ant-input-password')?.querySelector('.ant-input') as HTMLInputElement;
                      if (wrapper && !input?.value?.trim()) {
                        wrapper.classList.remove('focused');
                      }
                    }}
                    onChange={(e) => {
                      const wrapper = e.target.closest('.input-wrapper');
                      const input = e.target.closest('.ant-input-password')?.querySelector('.ant-input') as HTMLInputElement;
                      if (wrapper) {
                        if (input?.value && input.value.trim()) {
                          wrapper.classList.add('focused');
                        } else if (document.activeElement !== input) {
                          wrapper.classList.remove('focused');
                        }
                      }
                    }}
                  />
                  <label className="input-label" htmlFor="register-confirm-password-input">确认密码</label>
                </div>
              </Form.Item>

              <Form.Item
                name="provinceCode"
                style={{ display: 'none' }}
              >
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                name="cityCode"
                style={{ display: 'none' }}
              >
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                name="districtCode"
                style={{ display: 'none' }}
              >
                <Input type="hidden" />
              </Form.Item>
              <Form.Item>
                <AddressSelector
                  value={{
                    provinceCode: registerForm.getFieldValue('provinceCode'),
                    cityCode: registerForm.getFieldValue('cityCode'),
                    districtCode: registerForm.getFieldValue('districtCode'),
                  }}
                  onChange={(value) => {
                    registerForm.setFieldsValue({
                      provinceCode: value.provinceCode,
                      cityCode: value.cityCode,
                      districtCode: value.districtCode,
                    });
                  }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={registerLoading}
                  block
                  className="submit-btn"
                >
                  <span className="btn-text">注册</span>
                </Button>
              </Form.Item>
            </Form>

            <div className="form-footer">
              <span>已有账号？</span>
              <button type="button" className="switch-btn" onClick={switchToLogin}>
                立即登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
