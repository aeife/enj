export default {
  separator: function () {
    return `
      <div>
        <span>
          <br clear="none"/>
        </span>
      </div>
    `;
  },
  timeStamp: function (time) {
    return `
      <div>
        <span>
          <strong>${time}</strong>
        </span>
      </div>
    `;
  },
  entry: function (text) {
    return `
      <div>
        <span>
          <span>${text}</span>
        </span>
      </div>
    `;
  }
};
