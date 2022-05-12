import { useState, useRef, useEffect } from "react";
import {
  Card,
  Breadcrumb,
  Form,
  Button,
  Radio,
  Input,
  Upload,
  Space,
  Select,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// @ts-ignore
import {history, Link, useModel} from "umi";
import {http} from "@/plugins/http";

const { Option } = Select;

export default async () => {
  // @ts-ignore
  // const { initialState: {channelList} } = useModel('@@initialState');
  const { data: {channels:channelList}} = await http.get("/channels");
    // 存放上传图片的列表
  const [fileList, setFileList] = useState([]);

  // 这个函数的执行分阶段 是从updating到done的过程
  // 这个过程只要上传图片内容发生变化就会不断执行直到全部上传完毕
  // 使用useRef声明一个暂存仓库
  const cacheImgList = useRef([]);
  // 将filelist中的文件上传得到response，保存上传完成后返回的图片url
  const onUploadChange = ({ fileList:any }) => {
    // 同时把图片列表存入仓库一份
    // 这里关键位置:需要做数据格式化，从file.response中取出图片对应的url
    const formatList = fileList.map((file:any) => {
      // 上传完毕，做数据处理，简化返回的数据
      if (file.response) {
        return {
          url: file.response.data.url,
        };
      }
      return file;
    });
    setFileList(formatList);
    cacheImgList.current = formatList;
  };

  // 切换图片
  const [imgCount, setImageCount] = useState(1);
  // @ts-ignore
  const radioChange = (e) => {
    // 这里判断依据采取原始值，不采取经过useState方法修改的数据，这样无法同步获取修改之后的新值，
    // 通过传递的事件获取当前选择的图片数量
    // useState() 函数组件中维护状态的钩子函数
    // 更新流程：1.第一次执行以传入的默认值为主 -> 2.对数据进行修改，整个组件都重新执行一次，重新执行一次useState()函数，才能拿到最新的数据
    const rawValue = e.target.value;
    setImageCount(rawValue);
    // 无图模式 包括初始无图的时候
    if (cacheImgList.current.length === 0) {
      return false;
    }
    // 单图模式
    if (rawValue === 1) {
      const img = cacheImgList.current[0];
      setFileList([img]);
    } else if (rawValue === 3) {
      // 多图模式
      setFileList(cacheImgList.current);
    }
  };

  // 提交表单
  const onFinish = async (values:any) => {
    // 数据的二次处理，重点处理cover字段
    const { channel_id, content, title, type } = values;
    const params = {
      channel_id,
      content,
      title,
      type,
      cover: {
        type: type,
        images: fileList.map(({url}) => url),
      },
    };
    if (id) {
      await http.put(`/mp/articles/${id}?draft=false`, params);
    } else {
      await http.post("/mp/articles?draft=false", params);
    }

    // 跳转列表，提示用户
    history.push("/layout/article");
    message.success(`${id ? "更新成功" : "发布成功"}`);
  };

  // 编辑功能
  // 文案适配 路由参数id作为判断条件
  // @ts-ignore
  const {id} = useParams(); // 从路由中获取参数
    // 数据回填, id调用接口 1.表单回填 2.暂存列表 3.Upload组件fileList
  const [form] = Form.useForm();
  useEffect(() => {
    const loadDetail = async () => {
      const res = await http.get(`/mp/articles/${id}`);
      const data = res.data;
      // 表单数据回填
      form.setFieldsValue({ ...data, type: data.cover.type });
      // 调用setFileList方法回填Upload
      const formatImgList = data.cover.images.map((url: any) => ({ url }));
      setFileList(formatImgList);
      // 暂存列表也存一份(暂存列表和filelist回显列表保持数据结构统一)
      cacheImgList.current = formatImgList;
    };
    // 必须是编辑状态才可以发送请求
    if (id) {
      loadDetail();
    }
  }, [id]);

  return (
    <div className="publish">
      <Card
        title={
          <Breadcrumb separator=">">
            <Breadcrumb.Item>
              <Link to="/home">首页</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{id ? "编辑" : "发布"}文章</Breadcrumb.Item>
          </Breadcrumb>
        }
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          // 注意：此处需要为富文本编辑表示的 content 文章内容设置默认值
          initialValues={{ type: 1, content: "" }}
          onFinish={onFinish}
          form={form}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: "请输入文章标题" }]}
          >
            <Input placeholder="请输入文章标题" style={{ width: 400 }} />
          </Form.Item>
          <Form.Item
            label="频道"
            name="channel_id"
            rules={[{ required: true, message: "请选择文章频道" }]}
          >
            <Select placeholder="请选择文章频道" style={{ width: 400 }}>
              {channelList.map((item:any) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="封面">
            <Form.Item name="type">
              <Radio.Group onChange={radioChange}>
                <Radio value={1}>单图</Radio>
                <Radio value={3}>三图</Radio>
                <Radio value={0}>无图</Radio>
              </Radio.Group>
            </Form.Item>
            {imgCount > 0 && (
              <Upload
                name="image"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList
                action="http://geek.itheima.net/v1_0/upload"
                fileList={fileList}
                onChange={onUploadChange}
                multiple={imgCount > 1}
                maxCount={imgCount}
              >
                <div style={{ marginTop: 8 }}>
                  <PlusOutlined />
                </div>
              </Upload>
            )}
          </Form.Item>
          {/* 这里的富文本组件 已经被Form.Item控制 */}
          {/* 它的输入内容 会在onFinished回调中收集起来 */}
          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: "请输入文章内容" }]}
          >
            <ReactQuill theme="snow" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 4 }}>
            <Space>
              <Button size="large" type="primary" htmlType="submit">
                {id ? "更新" : "发布"}文章
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

