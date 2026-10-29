export default function LoaderPreviewPage() {
  // useEffect(() => {
  //   const timer = window.setTimeout(() => {
  //     // TODO: passer a la fiche publique ici
  //   }, 3000);

  //   return () => window.clearTimeout(timer);
  // }, []);

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-white">
      <img
        src="/images/Logo.png"
        alt="Logo Support Connecté"
        className="h-auto w-40 animate-pulse object-contain sm:w-48"
      />
    </main>
  );
}
