import * as React from 'react';
import useReactRouter from "use-react-router";
import { useDispatch } from "react-redux";

import { sessionLoginUserAction } from "ui/auth/actions";
import Header from "ui/common/Header";
import LoadingOverlay from 'ui/common/LoadingOverlay';
import { useAuthState } from "ui/reducer/hooks";
import PrivateRouting from 'app/PrivateRouting';
import PublicRouting from 'app/PublicRouting';
import { Routing } from 'app/constants';
import { buildProfileRouting } from 'ui/member/utils';
import ErrorBoundary from 'ui/common/ErrorBoundary';

const publicPaths = [Routing.Login, Routing.SignUp, Routing.PasswordReset];

const App: React.FC = () => {
  const { location: { pathname, search, hash }, history } = useReactRouter();
  const dispatch = useDispatch();
  const { currentUser: { id: currentUserId, isAdmin }, permissions, isRequesting, error } = useAuthState();
  const [attemptingLogin, setAttemptingLogin] = React.useState(true);
  const [loginAttempted, setLoginAttempted] = React.useState<boolean>();
  const [authSettled, setAuthSettled] = React.useState<boolean>();
  const { current: initialPath } = React.useRef(pathname);
  const { current: initialSearch } = React.useRef(search);
  const { current: initialHash } = React.useRef(hash);

  // Attempt login on mount except when going to password reset
  React.useEffect(() => {
    if (initialPath !== Routing.PasswordReset) {
      dispatch(sessionLoginUserAction());
    }
  }, []);

  React.useEffect(() => {
    setLoginAttempted(true);
  }, []);

  // Redirect after login if they were navigation elsewhere
  React.useEffect(() => {
    if (!error && !isRequesting && !authSettled) {
      loginAttempted && setAttemptingLogin(false);
      if (currentUserId) {
        if (
            initialPath &&
            initialPath !== Routing.Root && // Don't nav to initial if initial is root
            !publicPaths.some(path => initialPath.startsWith(path)) // or initial is a public path
          ) {
          history.push(initialPath + initialSearch + initialHash);

          // Don't redirect after a user signs up
        } else if (!pathname.startsWith(Routing.SignUp)) {
          history.push(buildProfileRouting(currentUserId));
        }
        setAuthSettled(true);
      }
    }
  }, [isRequesting]);

  return (
    <ErrorBoundary>
      <div className="root">
        <Header />
        {attemptingLogin ?
          <LoadingOverlay id="body" />
          : (currentUserId ? <PrivateRouting permissions={permissions} currentUserId={currentUserId} isAdmin={isAdmin} /> : <PublicRouting />)
        }
      </div>
    </ErrorBoundary>

  )
}

export default App;
