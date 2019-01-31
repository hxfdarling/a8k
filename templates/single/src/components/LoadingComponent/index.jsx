import React from 'react';
import './index.scss';

export default function(loading) {
  const { isLoading, error } = loading || {};
  if (isLoading) {
    return <div className="loading-com">loading...</div>;
  }
  if (error) {
    return <div className="loading-com">页面加载失败，请刷新重试！</div>;
  }
}
