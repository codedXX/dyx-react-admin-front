import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Lock, User, ArrowRight, LayoutDashboard } from "lucide-react";
import { authApi } from "@/services/api";
import { Form, Input, Checkbox, Button, Alert } from "antd";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleLogin = async (values: {
    username: string;
    password: string;
    remember: boolean;
  }) => {
    setLoading(true);
    setError("");

    try {
      const response = await authApi.login({
        username: values.username,
        password: values.password,
      });

      if (response.code === 200) {
        // 更新Store（Store 内部会自动保存到 localStorage）
        login(response.data.userInfo, response.data.token);

        // 跳转到仪表盘
        navigate("/dashboard");
      } else {
        setError(response.message || "登录失败");
      }
    } catch (err: any) {
      // 保持 err: any 以兼容 axios 错误结构，或者使用 unknown + 类型守卫。
      // 为简单起见，这里先保留 explicit any 但建议改为 AxiosError
      setError(err.response?.data?.message || "登录失败，请检查网络连接");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden relative">
      {/* Background Shapes */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-primary-200 mx-auto">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">React Admin Pro</h2>
          <p className="text-slate-500 mt-2">企业级后台管理系统解决方案</p>
        </div>

        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
          initialValues={{
            username: "admin",
            password: "123456",
            remember: false,
          }}
          className="space-y-1"
        >
          {error && (
            <Alert message={error} type="error" showIcon className="mb-4" />
          )}

          <Form.Item
            name="username"
            label={
              <span className="text-sm font-medium text-slate-700">用户名</span>
            }
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input
              prefix={<User size={18} className="text-slate-400" />}
              placeholder="请输入用户名"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <span className="text-sm font-medium text-slate-700">密码</span>
            }
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<Lock size={18} className="text-slate-400" />}
              placeholder="请输入密码"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex items-center justify-between">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>
                  <span className="text-slate-600">记住我</span>
                </Checkbox>
              </Form.Item>
              <a
                href="#"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                忘记密码？
              </a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              className="h-11 rounded-lg font-medium shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
            >
              {!loading && (
                <>
                  <span className="flex items-center">
                    <span>登录系统</span>
                    <ArrowRight size={18} />
                  </span>
                </>
              )}
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-6 text-center text-xs text-slate-400">
          提示: 此演示环境可使用任意用户名/密码登录。
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
