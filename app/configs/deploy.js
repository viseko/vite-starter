const deployConfig = {
  default: {
    include: [`**/*.*`],
    exclude: [
      `assets/img/**/*.*`,
      `assets/fonts/**/*.*`,
      `download/**/*.*`,
    ]
  },
  full: {
    include: [`**/*.*`],
  },
  images: {
    include: [`assets/img/**/*.*`],
  },
  assets: {
    include: [`assets/**/*.*`],
  }
};

export default deployConfig;
