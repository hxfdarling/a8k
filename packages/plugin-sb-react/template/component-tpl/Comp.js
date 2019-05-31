// react组件
export default function Comp(props) {
  const { isShow, children } = props;
  if (isShow) {
    return children;
  }
  return null;
}
