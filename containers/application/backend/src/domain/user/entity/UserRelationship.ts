export interface UserRelationshipProps {
  userId: string;
  targetId: string;
  type: 'friend';
  status: 'pending' | 'accepted';
  createdAt: number;
  updatedAt: number;
}

export class UserRelationship {
  private props: UserRelationshipProps;

  constructor(props: UserRelationshipProps) {
    this.props = props;
  }

  get userId() {
    return this.props.userId;
  }

  get targetId() {
    return this.props.targetId;
  }

  get type() {
    return this.props.type;
  }

  get status() {
    return this.props.status;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
}
