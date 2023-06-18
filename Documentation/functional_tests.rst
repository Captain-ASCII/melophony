
Functional tests
================

This little document lists the different functional tests to do before releasing a new version of Melophony.
May be exported to an external tool in the future (such as CucumberStudio or one of its alternatives).
Next step will be to add E2E tests with Selenium, etc.

Format of the document:
The document is split into several sections corresponding to the different functionalities offered by Melophony.
In each section, a list of items composed as the following can be found:
* <Simple step(s) to do for the test>: <check that should be done before considering the test as OK>

User aspect
-----------

* Try to connect using incorrect credentials: shouldn't be able to access Melophony
* Connect using a correct username and password: Access granted to Melophony
* Disconnect and check that access is restricted: shouldn't be able to access Melophony anymore
* Access personnal information modification page and change language: The application directly changes from one language to another, change is permanent
* Access personnal information modification page and change password: Passwords must match before validation, once disconnection, the password required should have changed

Track aspect
------------

* Add a new track: Track should appear in the track list
* Find a particular track: Track should appear if title or artist name is provided
* Sort tracks: Track should appear in the specified order
* Modify an already existing track: Modified information should appear even after reloading the page
* Delete track: Track should not appear in the track list anymore
* Play a track: Track should be playable using the player controls or clicking the track in the list
* Skip to next track / Get previous track: Controls should allow to go back and forth between tracks
* Display of current playlist: The current playlist (on the left of the application) should be consistent with the tracks that can be listened to
* Add track to current playlist: Clicking the playlist add button should add the track to the end of the current playlist

Playlist aspect
---------------

* Add a new playlist: Playlist should appear in the playlist list (track order should also be respected in the playlist)
* Modify an already existing playlist: Modified information should appear even after reloading the page
* Delete playlist: Playlist should not appear in the playlist list anymore
* Start a playlist: Playlist tracks should be added to the current playlist

Artist aspect
-------------

* Add a new artist: Artist should appear in the artist list
* Access artist: Artist track list should appear with his/her name and the corresponding picture
* Modify an already existing artist: Modified information should appear even after reloading the page
* Delete artist: Artist should not appear in the artist list anymore

