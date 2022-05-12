import {
  Table,
  Tag,
  Space,
  Card,
  Breadcrumb,
  Form,
  Button,
  Radio,
  DatePicker,
  Select,
  Popconfirm,
} from "antd";
import React, { useState, useEffect } from 'react';
import "moment/locale/zh-cn";
import locale from "antd/es/date-picker/locale/zh_CN";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import img404 from "@/assets/error.png";
// @ts-ignore
import {history, Link, useModel} from 'umi';
import {http} from "@/plugins/http";

const { Option } = Select;
const { RangePicker } = DatePicker;

export default async () => {
  // const { initialState } = useModel('@@initialState');
  const { data: {channels:channelList}} = await http.get("/channels");
  console.log(channelList);

  // 文章列表管理
  const [articleData, setArticleData] = useState({
    // 通过对象统一管理数据，将来修改给setList传对象
    list: [], // 文章列表
    count: 0, // 文章数量
  });

  // 文章参数管理
  const [params, setParams] = useState({
    page: 1,
    per_page: 10,
  });

  // 如果异步请求函数需要依赖一些数据的变化而重新执行，推荐把它写到useEffect的内部
  // 统一不抽离函数到外面，只要涉及到异步请求的函数，都放到useEffect的内部
  // 本质区别：写在外面，每次组建更新都会重新进行函数初始化，会造成性能消耗
  // 而写到useEffect中，只会在依赖项发生变化的时候，函数才会进行重新执行，避免性能损失
  useEffect(() => {
    const loadList = async () => {
      const res = await http.get("/mp/articles", { params });
      const { results, total_count } = res.data;
      setArticleData({
        list: results,
        count: total_count,
      });
    };
    loadList();
  }, [params]);

  // 获取新的params参数，重新渲染
  const onFinish = (values:any) => {
    const { channel_id, date, status } = values;
    // 数据处理
    const _params = {
      status: undefined,
      channel_id: undefined,
      begin_pubdate: undefined,
      end_pubdate: undefined,
    };
    if (status !== -1) {
      _params.status = status;
    }
    if (channel_id) {
      _params.channel_id = channel_id;
    }
    if (date) {
      _params.begin_pubdate = date[0].format("YYYY-MM-DD");
      _params.end_pubdate = date[1].format("YYYY-MM-DD");
    }
    // 修改params状态，引起接口的重新发送
    // setParams做了一个对象的合并操作，是整体覆盖，改了对象的整体引用
    setParams({
      ...params,
      ..._params,
    });
  };

  const pageChange = (page: number) => {
    setParams({
      ...params,
      page,
    });
  };

  const formatStatus = (type:number) => {
    const TYPES = {
      1: <Tag color="red">审核成功</Tag>,
      2: <Tag color="green">审核失败</Tag>,
    };
    return TYPES[type];
  };

  // 删除功能
  const delArticle = async (data:any) => {
    await http.delete(`/mp/articles/${data.id}`);
    // 刷新列表
    setParams({
      ...params,
      page: 1,
    });
  };

  // 编辑
  const goPublish = (data:any) => {
    history.replace(`/layout/publish?id=${data.id}`);
  };

  const columns = [
    {
      title: "封面",
      dataIndex: "cover",
      width: 120,
      render: (cover:any) => {
        return (
          <img src={cover.images[0] || img404} width={80} height={60} alt="" />
      );
      },
    },
    {
      title: "标题",
      dataIndex: "title",
      width: 220,
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (data:any) => formatStatus(data),
    },
    {
      title: "发布时间",
      dataIndex: "pubdate",
    },
    {
      title: "阅读数",
      dataIndex: "read_count",
    },
    {
      title: "评论数",
      dataIndex: "comment_count",
    },
    {
      title: "点赞数",
      dataIndex: "like_count",
    },
    {
      title: "操作",
      render: (data:any) => {
        return (
          <Space size="middle">
          <Button
            type="primary"
        shape="circle"
        icon={<EditOutlined />}
        onClick={() => goPublish(data)}
        />
        <Button
        type="primary"
        danger
        shape="circle"
        icon={
          <Popconfirm
        onConfirm={() => delArticle(data)}
        title="是否确认退出"
        okText="退出"
        cancelText="取消"
          >
          <DeleteOutlined />
          </Popconfirm>
      }
        // onClick={() => delArticle(data)}
        />
        </Space>
      );
      },
      fixed: "right",
    },
  ];
  // @ts-ignore
  return (
    <div>
      {/* 筛选区域 */}
    <Card
  title={
    <Breadcrumb separator=">">
  <Breadcrumb.Item>
    <Link to="/welcome">欢迎</Link>
    </Breadcrumb.Item>
    <Breadcrumb.Item>内容管理</Breadcrumb.Item>
    </Breadcrumb>
}
  style={{ marginBottom: 20 }}
>
  <Form onFinish={onFinish} initialValues={{ status: -1 }}>
  <Form.Item label="状态" name="status">
  <Radio.Group>
    <Radio value={-1}>全部</Radio>
  <Radio value={0}>草稿</Radio>
    <Radio value={1}>待审核</Radio>
    <Radio value={2}>审核通过</Radio>
    <Radio value={3}>审核失败</Radio>
    </Radio.Group>
    </Form.Item>

    <Form.Item label="频道" name="channel_id">
  <Select placeholder="请选择文章频道" style={{ width: 120 }}>
  {channelList.map((channel) => (
    <Option key={channel.id} value={channel.id}>
    {channel.name}
    </Option>
  ))}
  </Select>
  </Form.Item>

  <Form.Item label="日期" name="date">
    {/* 传入locale属性 控制中文显示*/}
    <RangePicker locale={locale}></RangePicker>
  </Form.Item>

  <Form.Item>
  <Button type="primary" htmlType="submit" style={{ marginLeft: 80 }}>
  筛选
  </Button>
  </Form.Item>
  </Form>
  </Card>
  {/* 文章列表区域 */}
  <Card title={`根据筛选条件共查询到 ${articleData.count} 条结果：`}>
  <Table
    rowKey="id"
    columns={columns}
    dataSource={articleData.list}
    pagination={{
      pageSize: params.per_page,
        total: articleData.count,
        onChange: pageChange,
        current: params.page,
    }}
    bordered
  />
  </Card>
  </div>
);
};
