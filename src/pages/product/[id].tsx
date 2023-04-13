import { stripe } from '@/src/lib/stripe'
import { ImageContainer, ProductContainer, ProductDetails } from '@/src/styles/pages/product'
import axios from 'axios'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import Stripe from 'stripe'

interface ProductProps {
	product: {
		id: string
		name: string
		imageUrl: string
		price: string
    description: string
    defaultPriceId: string
	}
}

export default function Product({product}: ProductProps) {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false)
  
  async function handleBuyProduct() {
    try {
      setIsCreatingCheckoutSession(true)
      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId
      })

      const { checkoutUrl } = response.data

      

      window.location.href = checkoutUrl
    } catch (error) {
      //Conectar com uma ferramenta da observabilidade (Datadog / Sentry)

      setIsCreatingCheckoutSession(false)

      alert('Falha ao redirecionar ao checkout')
    }
}


  return (
		<>
			<Head>
				<title>{product.name} |Ignite Shop</title>
			</Head>

			<ProductContainer>
				<ImageContainer>
					<Image src={product.imageUrl} width={520} height={480} alt="" />
				</ImageContainer>

				<ProductDetails>
					<h1>{product.name}</h1>
					<span>{product.price}</span>

					<p>{product.description}</p>

					<button
						disabled={isCreatingCheckoutSession}
						onClick={handleBuyProduct}
					>
						Comprar agora
					</button>
				</ProductDetails>
			</ProductContainer>
		</>
	);
}

// getStaticPaths => a gente sempre vai usar esse método para dizer para o next quais sao as paginas, parâmetros que queremos gerar versões statics
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: {id: 'prod_Nh6n3rPrMQ7gNj' } }
    ],
    fallback: true,
  }
}

//esse getStaticProps ou getServiceSideProps dentro dele e aplicando códigos que vai rodar no lado do servidor pela camada do node e podemos fazer chamada sensíveis para api, porem eles carrega executam somente no carregamento da pagina(primeiro load da pagina), se precisar executar uma ação, pelo serverside pelo lado do servidor, ou seja algo sensível que venha através de uma ação do usuário no caso, click de um button  ou qualquer coisa do tipo, nao tem como usar o getStaticProps ou getServiceSideProps, ai nesse caso e preciso criar uma rota api que se chama no next api route.

export const getStaticProps: GetStaticProps<any, {id: string}> = async ({ params }) => {
  const productId = params!.id

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  })

  const price = product.default_price as Stripe.Price
  if (!price.unit_amount) {
    return {
      props: null
    }
  }


  return {
    props: {
      product: { 
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat('pt-BR', (
          {
            style: 'currency',
            currency: 'BRL'
          }
        )).format(price.unit_amount / 100),
        description: product.description,
        defaultPriceId: price.id,
      }
    },
    revalidate: 60 * 60 * 1,
  }

}