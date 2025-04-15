import React from 'react'
import styled from 'styled-components/native';



export default function Current_orderbox(props:any) {

  return (
    <DetailsBox>
        <DetailText>Destination: Airport</DetailText>
        <DetailText>Remaining Distance: {props.remainingDistance}</DetailText>
        <DetailText>Speed: {props.speed}</DetailText>
        <DetailText>ETA: {props.eta}</DetailText>
        <DetailText>STEP: {props.step}</DetailText>

        <Buttondiv>
            <Stepbutton
              onPress={() => props.Onstepdone(props.id)}

             style={{backgroundColor: 'blue'}}>
                <Stepbuttontext>STEP DONE</Stepbuttontext>
            </Stepbutton>
            <Stepbutton style={{backgroundColor: 'red'}}>
                <Stepbuttontext>
                     Cancel
                </Stepbuttontext>
            </Stepbutton>

        </Buttondiv>
      </DetailsBox>
  )
}




const DetailsBox = styled.View`
  width: 100%;
  height: 200px;
  padding: 15px;
  border-radius: 8px;
  background-color: white;
  border: 1px solid #ddd;
  position: absolute;
  bottom: 5;
  align-self: center;
  elevation: 3;
`;

const DetailText = styled.Text`
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
`;

const Buttondiv = styled.View`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;

`

const Stepbutton = styled.TouchableOpacity`
 padding: 10px;
 border-radius: 10px;
`
const Stepbuttontext = styled.Text`
 font-size: 15px;
 color: white;
`