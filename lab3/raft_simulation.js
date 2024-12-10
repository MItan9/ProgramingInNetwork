const dgram = require('dgram');

const STATES = {
  FOLLOWER: 'Follower',
  CANDIDATE: 'Candidate',
  LEADER: 'Leader',
};

class Node {
  constructor(id, port, peers) {
    this.id = id; // Уникальный идентификатор узла
    this.port = port; // Порт, на котором работает узел
    this.peers = peers; // Список других узлов
    this.state = STATES.FOLLOWER; // Начальное состояние
    this.currentTerm = 0; // Текущий термин
    this.votedFor = null; // Узел, за которого проголосовал
    this.votesReceived = []; // Список голосов
    this.leaderId = null; // Текущий лидер
    this.lastHeartbeat = Date.now(); // Время последнего heartbeat
    this.electionTimeout = this.getRandomElectionTimeout(); // Тайм-аут выборов

    this.server = dgram.createSocket('udp4');
    this.server.on('message', (msg, rinfo) => this.onMessage(msg, rinfo));
    this.server.bind(this.port, () => {
      console.log(`Node ${this.id} listening on port ${this.port}`);
    });

    this.resetElectionTimer();
  }

  getRandomElectionTimeout() {
    return 1500 + Math.random() * 1500; // 1.5 - 3 секунды
  }

  resetElectionTimer() {
    clearTimeout(this.electionTimer);
    this.electionTimer = setTimeout(() => this.startElection(), this.electionTimeout);
  }

  onMessage(message, rinfo) {
    const data = JSON.parse(message);
    switch (data.type) {
      case 'RequestVote':
        this.handleRequestVote(data, rinfo);
        break;
      case 'RequestVoteResponse':
        this.handleRequestVoteResponse(data);
        break;
      case 'Heartbeat':
        this.handleHeartbeat(data);
        break;
      default:
        console.log(`Node ${this.id} received unknown message type.`);
    }
  }

  startElection() {
    this.state = STATES.CANDIDATE;
    this.currentTerm += 1;
    this.votedFor = this.id;
    this.votesReceived = [this.id];
    console.log(`Node ${this.id} started election for term ${this.currentTerm}`);

    const requestVoteMessage = JSON.stringify({
      type: 'RequestVote',
      term: this.currentTerm,
      candidateId: this.id,
    });

    this.peers.forEach((peer) => {
      this.sendMessage(requestVoteMessage, peer.port);
    });

    this.resetElectionTimer();
  }

  handleRequestVote(data, rinfo) {
    const { term, candidateId } = data;
    if (term > this.currentTerm) {
      this.currentTerm = term;
      this.votedFor = null;
      this.state = STATES.FOLLOWER;
    }

    let voteGranted = false;
    if (
      (this.votedFor === null || this.votedFor === candidateId) &&
      term >= this.currentTerm
    ) {
      voteGranted = true;
      this.votedFor = candidateId;
      this.resetElectionTimer();
      console.log(`Node ${this.id} voted for ${candidateId} in term ${term}`);
    }

    const response = JSON.stringify({
      type: 'RequestVoteResponse',
      term: this.currentTerm,
      voteGranted,
    });
    this.sendMessage(response, rinfo.port);
  }

  handleRequestVoteResponse(data) {
    const { term, voteGranted } = data;

    if (term > this.currentTerm) {
      this.currentTerm = term;
      this.state = STATES.FOLLOWER;
      this.votedFor = null;
      return;
    }

    if (this.state === STATES.CANDIDATE && voteGranted) {
      this.votesReceived.push(data.from);
      const majority = Math.floor((this.peers.length + 1) / 2) + 1;

      if (this.votesReceived.length >= majority) {
        this.becomeLeader();
      }
    }
  }

  handleHeartbeat(data) {
    const { term, leaderId } = data;

    if (term >= this.currentTerm) {
      this.currentTerm = term;
      this.leaderId = leaderId;
      this.state = STATES.FOLLOWER;
      this.votedFor = null;
      this.resetElectionTimer();
      console.log(`Node ${this.id} received heartbeat from Leader ${leaderId}`);
    }
  }

  becomeLeader() {
    this.state = STATES.LEADER;
    this.leaderId = this.id;
    console.log(`Node ${this.id} became leader in term ${this.currentTerm}`);
    this.sendHeartbeat();
    clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), 1000);
  }

  sendHeartbeat() {
    const message = JSON.stringify({
      type: 'Heartbeat',
      term: this.currentTerm,
      leaderId: this.id,
    });

    this.peers.forEach((peer) => {
      this.sendMessage(message, peer.port);
    });
  }

  sendMessage(message, port) {
    const buffer = Buffer.from(message);
    this.server.send(buffer, 0, buffer.length, port, 'localhost', (err) => {
      if (err) {
        console.error(`Node ${this.id} failed to send message`, err);
      }
    });
  }
}

// Создаем узлы и запускаем симуляцию
const nodes = [
  { id: 1, port: 5001 },
  { id: 2, port: 5002 },
  { id: 3, port: 5003 },
  { id: 4, port: 5004 },
  { id: 5, port: 5005 },
];

nodes.forEach((nodeInfo) => {
  const peers = nodes
    .filter((n) => n.id !== nodeInfo.id)
    .map((n) => ({ id: n.id, port: n.port }));
  new Node(nodeInfo.id, nodeInfo.port, peers);
});
