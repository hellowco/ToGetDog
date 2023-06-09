import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { authAtom, userState } from "../recoil";

import axios from "axios";
import { BACKEND_URL } from "../config";
import {
  NotificationsWrapper,
  SingleNotificationWrapper,
} from "../styles/NotificationsEmotion";

import UserIcon from "../components/UserIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import WalkingWithDog from "../assets/walking_with_dog.png";
import CancelEvent from "../assets/cancel-event.png";
import Loading from "../assets/loading.gif";
import { useInView } from "react-intersection-observer";

const SingleNotification = (data) => {
  const navigate = useNavigate();

  const onClick = (e) => {
    if (data.item.type === "좋아요") {
      navigate(`/board/${data.item.id}`);
    } else if (data.item.type === "팔로우") {
      navigate(`/feed/${data.item.id}`);
    }
  };

  return (
    <SingleNotificationWrapper onClick={() => onClick()}>
      <UserIcon text={data.item.nickName}></UserIcon>
      {data.item.type === "좋아요" ? (
        <div className="textWrapper">
          {data.item.nickName}님이 {data.item.dogName}님의 게시물을 좋아합니다.
        </div>
      ) : null}
      {data.item.type === "팔로우" ? (
        <div className="textWrapper">
          {data.item.nickName}님이 {data.item.dogName}님을 팔로우했습니다.
        </div>
      ) : null}
    </SingleNotificationWrapper>
  );
};

const Notifications = () => {
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState(userState);
  const setAuth = useSetRecoilState(authAtom);
  const [notifications, setNotifications] = useState([]);
  const [canceled, setCanceled] = useState(false);
  const [meetingCnt, setMeetingCnt] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const auth = useRecoilValue(authAtom);
  const [ref, inView] = useInView();
  const pageNo = useRef(0);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setAuth(null);
    console.log("로그아웃이 정상적으로 처리되었습니다.");
    navigate("/login");
  };

  const getNotifications = useCallback(async () => {
    if (!auth || !localStorage.getItem("recoil-persist")) {
      navigate("/login");
      return;
    }

    await axios
      .get(`${BACKEND_URL}/notify?pageNo=${pageNo.current}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
      })
      .then((response) => {
        if (response.data.notice.noticeList.length) {
          pageNo.current += 1;
        }
        setIsLoading(false);
        setHasNextPage(response.data.notice.noticeList.length === 20);
        setNotifications((notifications) => [
          ...notifications,
          ...response.data.notice.noticeList,
        ]);
        setCanceled(response.data.notice.meetingCancel);
        setMeetingCnt(response.data.notice.meetingCnt);
      })
      .catch((error) => {
        if (error.response.status === 404) {
          navigate("/*");
        } else if (error.response.status === 401) {
          alert("자동 로그아웃되었습니다.");
          handleLogout();
        }
      });
  });

  const cancelClick = () => {
    axios
      .put(`${BACKEND_URL}/notify/cancel`, null, {
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
      })
      .then((response) => {
        navigate("/walk");
      })
      .catch((error) => {});
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      setIsLoading(true);
      getNotifications();
    }
  }, [inView]);

  return (
    <div>
      <NotificationsWrapper>
        <div className="walkRequestWrapper" onClick={() => navigate("/walk")}>
          <div className="walkRequest">
            <div className="imgWrapper">
              <img className="walkIcon" src={WalkingWithDog} alt="walkIcon" />
            </div>
            <p>산책 요청 {meetingCnt}개</p>
          </div>
          <div className="toRequests">
            {meetingCnt === 0 ? null : <div className="notiCircle"></div>}
            <FontAwesomeIcon icon="fa-chevron-right" />
          </div>
        </div>
        {canceled ? (
          <div className="cancelWrapper" onClick={() => cancelClick()}>
            <div className="walkRequest">
              <div className="imgWrapper">
                <img className="walkIcon" src={CancelEvent} alt="walkIcon" />
              </div>
              <p>취소된 산책 약속이 있습니다.</p>
            </div>
            <div className="toRequests">
              <FontAwesomeIcon icon="fa-chevron-right" />
            </div>
          </div>
        ) : null}
        {notifications.map((item, idx) => (
          <SingleNotification
            item={item}
            idx={idx}
            key={idx}></SingleNotification>
        ))}
        {isLoading ? (
          <div className="tinyLoading">
            <img src={Loading} alt="loading..."></img>
          </div>
        ) : (
          <div ref={ref} className="scrollHandler" />
        )}
      </NotificationsWrapper>
    </div>
  );
};

export default Notifications;
