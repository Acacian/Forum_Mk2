import React, { Component, Fragment } from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';
import openSocket from 'socket.io-client';
import Button from '../../../components/Button/Button';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: '',
    comment: []
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    fetch('http://localhost:8080/feed/post/' + postId, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch post status');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({
          title: resData.post.title,
          author: resData.post.creator.name,
          image: 'http://localhost:8080/' + resData.post.imageUrl,
          date: new Date(resData.post.createdAt).toLocaleDateString('en-US'),
          content: resData.post.content,
        });
      })
      .catch(err => {
        console.log(err);
      });
    // fetch comments
    fetch('http://localhost:8080/comment/' + postId, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch comment status');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({
          // save all resData.comment(which is array)'s data
          comment: resData.comments?.map(comment => {
            return {
              ...comment
            };
          })
        });
      })
      .catch(err => {
        console.log(err);
      });
    const socket = openSocket('http://localhost:8080');
    socket.on('comments', data => {
      if (data.action === 'create') {
        this.addComment(data.comment);
      }
    });
  }

  // 5개 넘으면 마지막꺼 지우고 새로운 댓글 추가
  addComment = comment => {
    this.setState(prevState => {
      const updatedPosts = [...prevState.posts];
      if (prevState.comment.length > 4) {
        updatedPosts.pop();
        updatedPosts.unshift(comment);
      }
    });
  };

  // 댓글 등록하기
  makeComment = () => {
    const postId = this.props.match.params.postId;
    const comment = document.getElementById('comment').value;
    fetch('http://localhost:8080/comment/' + postId, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        comment: comment
      })
    })
      .then(res => {
        if (res.status !== 201) {
          throw new Error('Failed to create comment');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        this.setState({
          comment: [
            ...this.state.comment,
            {
              user_name: resData.user_name,
              comment: resData.comment
            }
          ]
        });
      })
      .catch(err => {
        console.log(err);
      });
  }


  render() {
    return (
      <Fragment>
        <section className="single-post">
          <h1>{this.state.title}</h1>
          <h2>
            Created by {this.state.author} on {this.state.date}
          </h2>
          <div className="single-post__image">
            <Image contain imageUrl={this.state.image} />
          </div>
          <p>{this.state.content}</p>
          <h2></h2>
          <div>
            <h2>
              실시간 댓글 Comment
            </h2>
          </div>
          <div className="single-post__comment">
          {this.state.comment && this.state.comment.length > 0 ? (
            this.state.comment.map((c, index) => (
              <h4 key={index}>유저 이름 : {c.user_name} 댓글 : {c.comment}</h4>
            ))
          ) : (
            <p>실시간 댓글이 없어요!</p>
          )}
            <form className="form">
              <div className="form-control">
                <label htmlFor="comment"></label>
                <textarea id="comment" rows="5"></textarea>
              </div>
              <Button mode="hover" design="focus" onClick= {this.makeComment}>댓글 등록하기</Button>
            </form>
          </div>
        </section>
      </Fragment>
    );
  }
}

export default SinglePost;
