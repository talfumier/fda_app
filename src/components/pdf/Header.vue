<template>
  <header>
    <img src="../../assets/images/logoFda.png" alt="Festival des Arts" class="logo"/>
    <div class="container">
      <h1>
        <span class="span-lh">Festival des Arts</span>
        <span class="span-rh">Merville</span>
      </h1>
    </div>
  </header>
</template>

<style scoped>
  header { 
    display: flex;
    justify-content:left;
    align-items: center;
    background-color: var(--green);    
    height:70px;
    font: Berlin Sans FB;
    text-align: center; 
  }
  header .logo {
    position: absolute;
    top:0px;
    left:0px;
    height: 70px;
  } 
  .container {
    display:flex;
    justify-content:space-between;
    align-items: center;
    padding:0px;
  } 
  h1 {
    display:flex;
    flex-wrap: nowrap;
    justify-content: left;
    font-size: 3.3rem;
    padding: 0 40%;
    font-family: 'Berlin Sans FB', Arial;
    margin:0;
    gap: 15px;
  } 
  .span-lh {
    color:var(--orange);
    text-wrap: nowrap;
  }
  .span-rh {
    color:var(--white);
  }

</style>