const threads = [
  {
    _id: 'thread_id_1',
    text: 'First thread',
    created_on: new Date(),
    bumped_on: new Date(),
    reported: false,
    delete_password: 'password',
    replies: []
  },
  {
    _id: 'thread_id_2',
    text: 'Second thread',
    created_on: new Date(),
    bumped_on: new Date(),
    reported: false,
    delete_password: 'password',
    replies: []
  }
];

exports.threads = threads;

exports.getThreadById = (id) => {
  return threads.find((thread) => thread._id === id);
};
