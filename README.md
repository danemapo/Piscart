# Piscart

Piscart is an independently branded photo-editor starter built with React Native and Expo. It is not affiliated with or endorsed by Picsart.

## Features in this starter

- Choose an image from your device gallery
- Rotate, flip horizontally, and make a centered square crop
- Reset edits to the original selected image
- Save edited images to your gallery
- Share an edited image using the Android share sheet
- GitHub Actions workflow to build an Android debug APK

Edits are processed on-device. This starter does not yet include AI image generation, background removal, premium billing, advanced filters, stickers, or collage tools.

## Run locally

Install Node.js 20 and Android development prerequisites, then run:

```bash
npm install
npx expo start
```

To generate the native Android project and run on a configured Android device:

```bash
npx expo prebuild --platform android
npx expo run:android
```

## Build an APK with GitHub Actions

1. Open the **Actions** tab in this repository.
2. Select **Android APK** and run the workflow, or push a commit to `main`.
3. Open the completed workflow run and download the `piscart-android-apk` artifact.
4. Install the APK on an Android device. Android may ask you to allow installation from the browser or file manager used to open it.

The workflow builds a **debug APK** for testing. It is not a signed production release. To attach the APK to a GitHub Release, create and push a version tag such as `v0.1.0`; the workflow uploads the APK to that release after the build succeeds.

## Version

Starter version: `0.1.0`

## License

MIT. See [LICENSE](LICENSE).
