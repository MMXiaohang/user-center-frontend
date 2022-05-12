import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';

const Blog: React.FC = (props) => {
  const {children} = props;
  return (
    <PageHeaderWrapper>
      {children}
    </PageHeaderWrapper>
  );
};

export default Blog;
