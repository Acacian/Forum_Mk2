import React from 'react';
import { NavLink } from 'react-router-dom';

import './NavigationItems.css';

const navItems = [
  { id: 'feed', text: '게시물', link: '/', auth: true },
  { id: 'login', text: '로그인', link: '/', auth: false },
  { id: 'signup', text: '회원가입', link: '/signup', auth: false }
];

const navigationItems = props => [
  ...navItems.filter(item => item.auth === props.isAuth).map(item => (
    <li
      key={item.id}
      className={['navigation-item', props.mobile ? 'mobile' : ''].join(' ')}
    >
      <NavLink to={item.link} exact onClick={props.onChoose}>
        {item.text}
      </NavLink>
    </li>
  )),
  props.isAuth && (
    <li className="navigation-item" key="logout">
      <button onClick={props.onLogout}>로그아웃</button>
    </li>
  ),
  // 미구현
  // props.isAuth && (
  //   <li className="navigation-item" key="findpost">
  //     <input onChange={onChange} value ={text} />
  //     <button> *게시글 찾기</button>
  //   </li>
  // )
];

export default navigationItems;
