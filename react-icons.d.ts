import 'react-icons';

declare module 'react-icons/lib' {
  interface IconBaseProps {
    className?: string;
    size?: string | number;
    style?: React.CSSProperties;
    key?: React.Key;
  }
}
