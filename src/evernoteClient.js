import {Evernote} from 'evernote';
import moment from 'moment';

const applicationName = 'simpleEdit';
let client;
let noteStore;
let dailyNote;

export default {
  init,
  addText
};

function init (cb) {
  const authToken = require('../config.json').developerKey;

  if (authToken == 'your developer token') {
    console.log('Please fill in your developer token');
    console.log('To get a developer token, visit https://sandbox.evernote.com/api/DeveloperToken.action');
    process.exit(1);
  }

  client = new Evernote.Client({token: authToken, sandbox: true});
  noteStore = client.getNoteStore();

  getDailyNote(note => {
    dailyNote = note;
    console.log('ready');
    cb();
  });
}

function getDailyNote (cb) {
  const filter = new Evernote.NoteFilter({words: 'applicationData:simpleEdit created:day'});
  const spec = new Evernote.NotesMetadataResultSpec({includeCreated: true, includeUpdated: true, includeAttributes: true});

  client.getNoteStore().findNotesMetadata(filter, 0, 1, spec, function (err, result) {
      if (err) {
          console.log('error while searching daily note');
          console.log(err);
      } else {
        if (!result.notes.length) {
          console.log('no daily note available yet');
          createDailyNote(({guid}) => {
            getNote(guid, cb)
          });
        } else {
          console.log('daily note already exists');
          getNote(result.notes[0].guid, cb)
        }
      }
  });
}

function getNote (guid, cb) {
  console.log('fetching daily note');
  noteStore.getNote(guid, true, true, true, true, function (err, note) {
    if (err) {
      console.log('error while fetching note');
      console.log(err);
    } else {
      cb(note);
    }
  });
}

function createDailyNote (cb) {
  console.log('creating daily note');
  let note = new Evernote.Note();
  note.title = moment().format('MMMM Do YYYY');

  note.content = `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
    <en-note></en-note>
  `;

  console.log(note.content);

  // note.content = '<?xml version="1.0" encoding="UTF-8"?>';
  // note.content += '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">';
  // note.content += '<en-note>TEST<br/>';
  // note.content += '</en-note>';

  noteStore.createNote(note, function(err, createdNote) {
    if (err) {
      console.log('error while creating daily note');
    } else {
      setApplicationDataForNote(createdNote.guid, cb)
    }
  });
}

function setApplicationDataForNote (guid, cb) {
  console.log('setting applicationData on daily note');
  noteStore.setNoteApplicationDataEntry(guid, applicationName, applicationName, function (err, result) {
    if (err){
      console.log('error while setting applicationData for note');
    } else {
      cb({guid});
    }
  });
}

function addText (text) {
  let time = moment().format('h:mm:ss a');
  let tmpl = `
    <div>
      <span>
        <br clear="none"/>
      </span>
    </div>
    <div>
      <span>
        <strong>${time}</strong>
        <br clear="none"/>
        <span>
          ${text}
        </span>
        <br clear="none"/>
      </span>
    </div>
  `;
  dailyNote.content = dailyNote.content.replace('</en-note>', tmpl + '</en-note>');
  noteStore.updateNote(dailyNote, function (err, result) {
    if (err) {
      console.log("error while adding text to daily note");
      console.log(err);
    } else {
      // console.log(result);
    }
  });
}
