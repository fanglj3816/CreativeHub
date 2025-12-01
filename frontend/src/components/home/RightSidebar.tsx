import React from 'react';
import UserCard from './UserCard';
import InspirationCard from './InspirationCard';
import CreatorRankCard from './CreatorRankCard';
import { currentUser, inspirations, creatorRanks } from '../../mock/homepageMock';
import './RightSidebar.css';

const RightSidebar: React.FC = () => {
  return (
    <aside className="home-right-sidebar">
      <UserCard user={currentUser} />
      <InspirationCard inspirations={inspirations} />
      <CreatorRankCard creators={creatorRanks} />
    </aside>
  );
};

export default RightSidebar;

