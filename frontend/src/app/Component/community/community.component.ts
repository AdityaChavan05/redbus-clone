import { Component, OnInit } from '@angular/core';

export interface ForumPost {
  id: string;
  author: string;
  isVerified: boolean;
  topic: 'Routes' | 'Tips' | 'Destinations';
  title: string;
  content: string;
  imageUrl?: string;
  likes: number;
  commentsCount: number;
  shares: number;
  reportsCount: number;
  createdAt: string;
  userLiked?: boolean;
}

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css']
})
export class CommunityComponent implements OnInit {
  isVerifiedUser: boolean = true;
  activeTopic: string = 'All';
  newPostTitle: string = '';
  newPostContent: string = '';
  newPostTopic: 'Routes' | 'Tips' | 'Destinations' = 'Routes';
  newPostImage: string = '';
  isModerationView: boolean = false;

  posts: ForumPost[] = [
    {
      id: 'p1',
      author: 'Rahul Sharma',
      isVerified: true,
      topic: 'Routes',
      title: 'Majestic to Panjim via VRL Volvo 9600 - Route Review',
      content: 'Took the overnight sleeper via Hubballi. The new highway stretch is super smooth with very little body roll in the lower berth. Clean rest stop near Belagavi at 2 AM!',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=700&q=80',
      likes: 34,
      commentsCount: 6,
      shares: 12,
      reportsCount: 0,
      createdAt: '2 hours ago'
    },
    {
      id: 'p2',
      author: 'Priya Nair',
      isVerified: true,
      topic: 'Tips',
      title: 'Top 3 Tips for Sleeper Coaches on Western Ghats',
      content: 'Always book lower deck single window seats (L-A) if you are prone to motion sickness. Also, carry light woolens as the AC on Volvo B11R stays cold throughout the night.',
      likes: 58,
      commentsCount: 14,
      shares: 28,
      reportsCount: 0,
      createdAt: '1 day ago'
    }
  ];

  ngOnInit(): void {
    const saved = localStorage.getItem('rb_community_posts');
    if (saved) {
      try {
        this.posts = JSON.parse(saved);
      } catch (e) {
        console.warn('Could not parse saved posts');
      }
    }
  }

  savePosts(): void {
    localStorage.setItem('rb_community_posts', JSON.stringify(this.posts));
  }

  get displayedPosts(): ForumPost[] {
    if (this.isModerationView) {
      return this.posts.filter(p => p.reportsCount > 0);
    }
    if (this.activeTopic === 'All') {
      return this.posts.filter(p => p.reportsCount < 3);
    }
    return this.posts.filter(p => p.topic === this.activeTopic && p.reportsCount < 3);
  }

  createPost(): void {
    if (!this.newPostTitle.trim() || !this.newPostContent.trim()) {
      alert('Please fill out the post title and content.');
      return;
    }

    const post: ForumPost = {
      id: 'p_' + Date.now(),
      author: 'Aditya Chavan (You)',
      isVerified: this.isVerifiedUser,
      topic: this.newPostTopic,
      title: this.newPostTitle.trim(),
      content: this.newPostContent.trim(),
      imageUrl: this.newPostImage.trim() || undefined,
      likes: 0,
      commentsCount: 0,
      shares: 0,
      reportsCount: 0,
      createdAt: 'Just now'
    };

    this.posts.unshift(post);
    this.newPostTitle = '';
    this.newPostContent = '';
    this.newPostImage = '';
    this.savePosts();
  }

  toggleLike(post: ForumPost): void {
    post.userLiked = !post.userLiked;
    post.likes += post.userLiked ? 1 : -1;
    this.savePosts();
  }

  shareExternal(post: ForumPost): void {
    post.shares++;
    this.savePosts();
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${post.title} - Read more on redBus Community: ${window.location.href}`);
      alert('Post link copied to clipboard for sharing!');
    }
  }

  reportPost(post: ForumPost): void {
    post.reportsCount++;
    this.savePosts();
    alert('Thank you. The post has been flagged for moderator review.');
  }

  removePost(postId: string): void {
    this.posts = this.posts.filter(p => p.id !== postId);
    this.savePosts();
  }
}