import { AppProps } from "next/app";
import { globalStyles } from "../styles/global";

import logoImg from '../assets/logo.svg'
import Image from "next/image";
import { Container, Header } from "../styles/pages/app";

globalStyles(); //o melhor e ficar fora da função pois ele dentro da função, ele vai ser executado novamente na hora que eu trocar de pagina sendo que meu estilos globais nao muda então o melhor lugar para ele ficar e fora do App

export default function App({ Component, pageProps }: AppProps) {

  return (
    <Container>
      <Header>
        <Image src={logoImg} alt=""/>
      </Header>
      <Component {...pageProps} />
    </Container>
  )
}
