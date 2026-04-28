/* 本地配置（勿提交到公开仓库时请改用 .gitignore + example） */
window.SUPABASE_URL = "https://frvgdzeuaxamegkxkelw.supabase.co";
window.SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydmdkemV1YXhhbWVna3hrZWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTc3OTksImV4cCI6MjA5MjYzMzc5OX0.dSJVgIeb7wZICxe5ypXD21z92NZPuvSiouzlhDZoBsY";

/* Shared Supabase client — create once, reuse everywhere */
(function () {
  const lib = window.supabase;
  if (!lib || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) return;
  const create =
    typeof lib.createClient === "function"
      ? lib.createClient
      : lib.default?.createClient;
  if (create) window._sbClient = create(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
})();
