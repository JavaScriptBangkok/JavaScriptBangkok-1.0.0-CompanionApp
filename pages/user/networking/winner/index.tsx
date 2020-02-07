import React from 'react';
import { observer } from 'mobx-react-lite';

import { withRequiredAuthentication } from '../../../../components/authentication';

const UserProfile: React.FC = observer(() => {

  return (
    <div className='h-full flex flex-col'>
      
      <div className='h-full text-center w-full flex flex-col items-center justify-center'>
        <div className='max-w-small'>
          <div className='mb-5 text-2xl  font-extrabold text-center'>
            Congratulations! You are the winner.
          </div>
          <div className='text-center'>
            Please <span className='font-extrabold'>claim your reward</span>
            at the information desk.
          </div>
        </div>
      </div>
    </div>
  );
});

export default withRequiredAuthentication(UserProfile);
