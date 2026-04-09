module.exports = function(eleventyConfig) {
  // 기존 HTML 파일을 passthrough로 처리 (템플릿으로 해석하지 않음)
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("precedent-stats.json");
  eleventyConfig.addPassthroughCopy("about.html");
  eleventyConfig.addPassthroughCopy("404.html");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("llms.txt");
  eleventyConfig.addPassthroughCopy("stats.json");
  eleventyConfig.addPassthroughCopy(".nojekyll");

  // CSS 및 이미지 뷰어 페이지
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy({ "images/index.html": "images/index.html" });

  // 샤딩된 데이터 파일 (public/data/ → _site/data/)
  eleventyConfig.addPassthroughCopy({ "public/data": "data" });

  // 로컬 이미지 서빙 (개발용 심링크)
  eleventyConfig.addPassthroughCopy({ "local-images": "local-images" });

  return {
    templateFormats: ["njk"],
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
