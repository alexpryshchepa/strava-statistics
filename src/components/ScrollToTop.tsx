import { useEffect } from 'react';
import { useLocation, RouteComponentProps } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation<RouteComponentProps>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
