import {Evernote} from 'evernote';
import moment from 'moment';
import templates from './templates';
import winston from 'winston';

const applicationName = 'simpleEdit';
let client;
let noteStore;
let dailyNote;

export default {
  init,
  addText
};

function init (config, cb) {
  const authToken = config.developerKey;

  client = new Evernote.Client({token: authToken, sandbox: true});
  noteStore = client.getNoteStore();

  getDailyNote(note => {
    dailyNote = note;
    winston.debug('initialized and ready to write daily note');
    cb();
  });
}

function getDailyNote (cb) {
  const filter = new Evernote.NoteFilter({words: 'applicationData:simpleEdit created:day'});
  const spec = new Evernote.NotesMetadataResultSpec({includeCreated: true, includeUpdated: true, includeAttributes: true});

  client.getNoteStore().findNotesMetadata(filter, 0, 1, spec, function (err, result) {
      if (err) {
          winston.error('error while searching daily note');
          winston.debug(err);
      } else {
        if (!result.notes.length) {
          winston.debug('no daily note available yet');
          createDailyNote(({guid}) => {
            getNote(guid, cb)
          });
        } else {
          winston.debug('daily note already exists');
          getNote(result.notes[0].guid, cb)
        }
      }
  });
}

function getNote (guid, cb) {
  winston.debug('fetching daily note');
  noteStore.getNote(guid, true, true, true, true, function (err, note) {
    if (err) {
      winston.error('error while fetching note');
      winston.debug(err);
    } else {
      cb(note);
    }
  });
}

function createDailyNote (cb) {
  winston.debug('creating daily note');
  let note = new Evernote.Note();
  note.title = moment().format('MMMM Do YYYY');

  note.content = `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
    <en-note></en-note>
  `;

  noteStore.createNote(note, function(err, createdNote) {
    if (err) {
      winston.error('error while creating daily note');
      winston.debug(err);
    } else {
      setApplicationDataForNote(createdNote.guid, cb)
    }
  });
}

function setApplicationDataForNote (guid, cb) {
  winston.debug('setting applicationData on daily note');
  noteStore.setNoteApplicationDataEntry(guid, applicationName, applicationName, function (err, result) {
    if (err){
      winston.error('error while setting applicationData for note');
      winston.debug(err);
    } else {
      cb({guid});
    }
  });
}

function addText (text) {
  let time = moment().format('h:mm a');
  text = text.replace(/\n/g, '<br/>');
  let tmpl;
  if (dailyNote.content.indexOf(templates.timeStamp(time)) > -1) {
    tmpl = templates.entry(text);
  } else {
    tmpl = templates.separator() + templates.timeStamp(time) + templates.entry(text);
  }

  dailyNote.content = dailyNote.content.replace('</en-note>', tmpl + '</en-note>');
  noteStore.updateNote(dailyNote, function (err, result) {
    if (err) {
      winston.error("error while adding text to daily note");
      winston.debug(err);
    } else {
      winston.debug('daily note successfully updated');
    }
  });
}
