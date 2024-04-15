import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';
import openSocket from 'socket.io-client';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: '',
    comment: [],
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
        console.log(this.state.comment[0].comment);
      })
      .catch(err => {
        console.log(err);
      });

      const socket = openSocket('http://localhost:8080');
      socket.on('comment', data => {
        this.addComment(data.comment);
      });
  }

  addComment = post => {
    this.setState(prevState => {
      const updatedComments = [...prevState.comments];
      // if we have 6 comments, remove the last one
      if (prevState.comments.length >= 6) {
        updatedComments.pop();
      }
      updatedComments.unshift(post);
      return {
        comments: updatedComments
      };
    });
  };

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
        <div>
          <h2>
            실시간 댓글 Comment
          </h2>
        </div>
        <div className="single-post__comment">
          <h1>
            {/* {this.state.comment[0].comment} */}
          </h1>
          <form className="form">
            <div className="form-control">
              <label htmlFor="comment"></label>
              <textarea id="comment" rows="5"></textarea>
            </div>
            <button type="submit">댓글 등록하기</button>
          </form>
        </div>
      </section>
    );
  }
}

export default SinglePost;
