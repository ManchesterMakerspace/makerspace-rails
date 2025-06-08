 import * as React from 'react';
 import Paper from '@material-ui/core/Paper';

 const Card: React.FC = ({ children }) => {
   return (
    <Paper style={{ margin: "1rem", padding: "1rem" }}>
      {children}
    </Paper>
   );
 };
 
 export default Card;
 