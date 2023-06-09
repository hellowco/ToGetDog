import { ErrorWrapper, ErrorImg } from '../styles/ErrorEmotion';
import { HomeTextBtn } from '../styles/BtnsEmotion';
import { useNavigate } from 'react-router-dom';

import Snoopy from '../assets/snoopy.jpg';

const NotFoundUser = () => {
  const navigate = useNavigate();

  return (
    <ErrorWrapper>
      <ErrorImg src={Snoopy} />
      <div className='error'>Deleted User...</div>
      <div className='errorDesc'>탈퇴한 사용자의 페이지입니다.</div>
      <HomeTextBtn
        onClick={() => {
          navigate('/');
        }}
      >
        홈으로 이동
      </HomeTextBtn>
    </ErrorWrapper>
  );
};

export default NotFoundUser;
