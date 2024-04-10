import React from 'react';

import Button from '../../Button/Button';
import './Post.css';

const post = props => (
  <article className="post">
    <header className="post__header">
      <h3 className="post__meta">
        작성자 : {props.author} 게시일: {props.date}
      </h3>
      <h1 className="post__title">{props.title}</h1>
    </header>
    {/* <div className="post__image">
      <Image imageUrl={props.image} contain />
    </div>
    <div className="post__content">{props.content}</div> */}
    <div className="post__actions">
      <Button mode="flat" link={props.id}>
        자세히보기
      </Button>
      <Button mode="flat" onClick={props.onStartEdit}>
        편집하기
      </Button>
      <Button mode="flat" design="danger" onClick={props.onDelete}>
        삭제하기
      </Button>
    </div>
  </article>
);

export default post;
