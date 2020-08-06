/* eslint-disable class-methods-use-this */
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/analytics';
import 'firebase/storage';
import 'firebase/functions';
import 'firebase/firestore';

// import { push } from 'react-router-redux'
import { useState, useEffect } from 'react';

// import { toast } from 'react-toastify';
import { firebaseConfig } from 'config';

export const clearLocalStorage = async () => {
  localStorage.clear();
};

class FirebaseAuthService {
  constructor() {
    this.fbApp = firebase.initializeApp(firebaseConfig.app);
    this.auth = this.fbApp.auth();
    this.analytics = firebase.analytics();
    this.db = firebase.firestore();
    this.properties = [];
  }

  /**
   * initiate the stripe transaction
   * chargeId found in the slot doc private.tranStripeId
   * @param {string} chargeId
   * @returns {promise} resolves if charge goes through
   */
  callInitiateStripeChargeFunction(chargeId) {
    return firebase.functions().httpsCallable('captureCharge')(chargeId);
  }

  /**
   * set a subscriber to listen to firestore document updates
   *
   * critical in VideoCall/index.js to update call events
   *
   * @param {string} slotId firestore id of the active slot
   * @param {function} observer callback function for when the doc updates
   * @param {function} errorObserver callback function for if the doc encounters a fatal error
   */
  // @link https://blog.logrocket.com/react-hooks-with-firebase-firestore/
  streamCallSlotData(slotId, observer, errorObserver) {
    if (slotId && observer)
      return this.db.collection('Schedule')
        .doc(slotId)
        .onSnapshot(observer, errorObserver);
  }

  /**
   * sets a new screen in google analytics
   *
   * @param {string} page_title human readable-ish title of the page
   * @param {string} path url of page
   */
  setScreen(page_title, path) {
    // @link https://firebase.google.com/docs/reference/js/firebase.analytics.Analytics#setcurrentscreen
    this.analytics.setCurrentScreen(page_title);
    // @link https://firebase.google.com/docs/reference/js/firebase.analytics.Analytics#parameters_8
    this.analytics.logEvent('page_view', { path, page_title });
  }

  /**
   * log an event to google analytics
   * @link
   * @param {*} eventName
   * @param {*} options
   */
  logEvent(eventName, options = {}) {
    // @link https://firebase.google.com/docs/reference/js/firebase.analytics.Analytics#logevent

    let params = { admin: true };

    if (options)
      params = {
        ...params,
        ...options,
      };

    this.analytics.logEvent(eventName, params);
  }

  authHook() {
    const [state, setState] = useState(() => {
      const user = firebase.auth().currentUser;
      console.log('useAuth', user);
      return { initializing: !user, user };
    });
    function onChange(user) {
      setState({ initializing: false, user });
    }

    useEffect(() => {
      // listen for auth state changes
      const unsubscribe = firebase.auth().onAuthStateChanged(onChange);
      // unsubscribe to the listener when unmounting
      return () => unsubscribe();
    }, []);

    return state;
  }

  /**
   * Create a Callable Function
   * @link https://firebase.google.com/docs/functions/callable#web
   *
   * @param {string} triggerString of the callable function
   */
  generateCallableFunction(triggerString) {
    return firebase.functions().httpsCallable(triggerString);
  }

  async createNewUser({ email, password }) {
    return this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => this.auth.createUserWithEmailAndPassword(email, password));
  }

  async signInUser({ username, password }) {
    return this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => {
        firebase.analytics().logEvent('login', { method: 'EmailAndPassword' });
        return this.auth.signInWithEmailAndPassword(username, password);
      });
  }

  resetPasswordFromEmail(email) {
    return this.auth.sendPasswordResetEmail(email);
  }

  async getToken() {
    if (this.auth.currentUser)
      return this.auth.currentUser.getIdToken()
        .then((_token) => _token) // console.log('id token~~', _token, typeof token)
        .catch((err) => console.error('FirebaseAuthService getToken Error', err));
    return false;
  }

  getTokenPromise() {
    if (this.auth.currentUser)
      return this.auth.currentUser.getIdToken();
    return false;
  }

  /**
   * returns saved active user
   * @link https://firebase.google.com/docs/reference/js/firebase.User#uid
   * @param {boolean} reload flag to trigger manual reload of info
   */
  getUser(reload = false) {
    if (reload && firebase.auth().currentUser) {
      firebase.auth().currentUser.reload();
      this.user = firebase.auth().currentUser; // get from db in case of changes
    }
    const { user } = this;
    // console.log('user', user, typeof user)
    if (user)
      return user;

    return null;
  }

  /**
   * force user reload and then get user information
   */
  async getUserReload() {
    await firebase.auth().currentUser.reload();
    this.user = firebase.auth().currentUser; // get from db in case of changes

    const { user } = this;
    // console.log('user', user, typeof user)
    if (user)
      return user;

    return null;
  }

  getUserData() {
    // returns photourl and name of the signed in user
    const user = this.auth.currentUser;

    if (user) // ensure user is defineda
      return {
        photoUrl: user.photoURL,
        name: user.displayName,
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
      };
    // else
    return {};
  }

  updateUserData({ obj, quiet = false }) {
    const user = this.auth.currentUser;

    user.updateProfile(obj)
      .then(() => {
        // if (!quiet) toast.info('Account updated!');
        console.log('updateUserData success', obj);
      }).catch((error) => {
        // if (!quiet) toast.error('Error. Account not updated');

        console.error('account update error:', error);
      });
  }

  updateUserDataPromise({ obj, quiet = false }) {
    const user = this.auth.currentUser;

    return user.updateProfile(obj);
  }

  onAuthStateChanged(callback) {
    return this.auth.onAuthStateChanged(callback);
  }

  isAuthenticated() {
    const user = this.auth.currentUser;
    if (user)
      return true;

    return null;
  }

  signIn() {
    // console.log(JSON.stringify(this.auth.currentUser))
    // localStorage.setItem("User", JSON.stringify(this.auth.currentUser))
  }

  signOut() {
    this.auth.signOut()
      .then(() => {
        localStorage.clear();
      })
      .catch((error) => {
        console.error(`Logoout error: ${JSON.stringify(error)}`);
      });
  }

  uploadFile(file, destination, metadata = {}, quiet = false) {
    const storageRef = firebase.storage().ref();
    const destinationRef = storageRef.child(destination);

    destinationRef.put(file, metadata)
      .then((snapshot) => {
        console.log('uploaded file. snapshot:', snapshot);
        // if (!quiet) toast.info('Image Upload Successful');
      })
      .catch((err) => {
        // if (!quiet) toast.error('Image Upload Failed');
        console.log('Image Upload Error', err);
      });
  }

  generateStorageRef(path = false) {
    const storageRef = firebase.storage().ref();
    if (path)
      return storageRef.child(path);
    return storageRef;
  }

  getStorageDownloadUrl(filename) {
    // console.log(imageRef, imageRef.location.path_, filename)
    return firebase.storage()
      .ref(filename)
      // .child(filename)
      .getDownloadURL();
  }

  async generateFileUrl(url) {
    try {
      const res = await firebase.storage()
        .refFromURL(url)
        .getDownloadURL();
      return res;
    } catch (e) {
      console.error('file load error. url:', url, e);
      return 'err';
    }
  }

  updateUserEmailAddress(newEmail, quiet = false) {
    const user = this.auth.currentUser;

    user.updateEmail(newEmail)
      .then(() => {
        console.log('Email sent! Refresh page to view changes');
        // if (!quiet) toast.info('Email sent! Refresh page to view changes');
      })
      .catch((error) => {
        // if (!quiet) toast.error(`Error updating email: ${error.message || '631'}`);
        console.error('updateUserEmailAddress error:', error);
      });
  }

  sendEmailVerification(quiet = false) {
    const user = this.auth.currentUser;

    // triggers callable cloud function: welcomeEmailTutor
    const sendWelcomeEmail = firebase.functions().httpsCallable('welcomeEmailTutor');

    sendWelcomeEmail()
      .then(() => {
        console.log('Email sent! Refresh page to view changes');
        // if (!quiet) toast.info('Email sent! Refresh page to view changes');
      })
      .catch((error) => {
        // if (!quiet) toast.error(`Error sending email: ${error.message || '632'}`);
        console.error('sendEmailVerification error:', error);
      });
  }

  sendPasswordResetEmail(quiet = false) {
    const { email } = this.auth.currentUser;

    this.auth.sendPasswordResetEmail(email)
      .then(() => {
        console.log('Email sent!');
        // if (!quiet) toast.info('Email sent!');
      })
      .catch((error) => {
        // An error happened.
        // if (!quiet) toast.error(`Error sending email: ${error.message || '633'}`);
        console.error('sendPasswordResetEmail error:', error);
      });
  }

  removeSignUrl(signed_url) { // remove signature on image url,
    const n = signed_url.indexOf('?'); // index of start of url queries
    const unsignedUrl = signed_url.substring(0, n !== -1 ? n : signed_url.length); // remove query params
    return unsignedUrl.replace('https://storage.googleapis.com/modal-health-249620.appspot.com/', 'gs://modal-health-249620.appspot.com/');
  }
}

export default new FirebaseAuthService();
