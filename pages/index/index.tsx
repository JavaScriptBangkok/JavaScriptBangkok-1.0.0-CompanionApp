import { useLocalStore } from 'mobx-react-lite';
import React, { useState } from 'react';
import useSchedule from '../../commons/hooks/scheduleHook';
import createModalStore from '../../commons/stores/authModalStores';
import Announcements from '../../components/announcements/Announcements';
import ScheduleBox from '../../components/conference';
import Staff from '../../components/conference/Staff';
import { Schedule } from '../../interfaces/Schedule';

const Home: React.FC = () => {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule>();
  const schedules = useSchedule();
  const modalStore = useLocalStore(() => createModalStore(400, false));

  const openScheduleModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    modalStore.setModalOpen(true);
  };

  return (
    <>
      <Staff modalStore={modalStore} schedule={selectedSchedule} />
      <div>
        <div className='border-2 border-yellow-dark rounded-lg bg-yellow-light p-4 m-4'>
          <Announcements />
        </div>
        <div className='text-white text-1xl mx-4 mt-4 font-bold'>Schedule</div>
        <ScheduleBox openSchedule={openScheduleModal} schedules={schedules} />
        <div className='flex items-center justify-center my-4'>
          <TweetButton />
        </div>
      </div>
    </>
  );
};

const TweetButton: React.FC = () => {
  return (
    <a
      href='https://twitter.com/intent/tweet?hashtags=jsbangkok'
      target='_blank'
      rel='noopener noreferrer'
      data-testid='tweet-button'
      className='block mt-4 py-3 px-4 text-center font-bg bg-yellow-dark text-black rounded'
    >
      Tweet #jsbangkok
    </a>
  );
};

export default Home;
