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
      })
      .catch(err => {
        console.log(err);
      });
    // const socket = openSocket('http://localhost:8080');
    // socket.on('comments', data => {
    //   if (data.action === 'create') {
    //     this.addPost(data.post);
    //   } else if (data.action === 'update') {
    //     this.updatePost(data.post);
    //   } else if (data.action === 'delete') {
    //     this.loadPosts();
    //   }
    // });
  }

  addComment = post => {
    this.setState(prevState => {
      const updatedPosts = [...prevState.posts];
      if (prevState.postPage === 1) {
        if (prevState.posts.length >= 2) {
          updatedPosts.pop();
        }
        updatedPosts.unshift(post);
      }
      return {
        posts: updatedPosts,
        totalPosts: prevState.totalPosts + 1
      };
    });
  };

  loadComments = direction => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }
    fetch('http://localhost:8080/feed/posts?page=' + page, {
      headers: {
        Authorization: 'Bearer ' + this.props.token
      }
    })
      .then(res => {
        if (res.status !== 200) {
          throw new Error('Failed to fetch posts.');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({
          posts: resData.posts.map(post => {
            return {
              ...post,
              imagePath: post.imageUrl
            };
          }),
          totalPosts: resData.totalItems,
          postsLoading: false
        });
      })
      .catch(this.catchError);
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
        {this.state.comment && this.state.comment.length > 0 ? (
          this.state.comment.map((c, index) => (
            <h4 key={index}>유저 이름 : {c.user_name} 댓글 : {c.comment}</h4>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
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
