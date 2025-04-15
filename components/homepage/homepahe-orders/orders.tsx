import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Text, TouchableOpacity, View } from 'react-native';

// Define the props interface for better type safety
interface JobOfferProps {
  id: string;
  orderNumber: string;
  orderMode: string;
  destination: string;
  pickupLocation: string;
  price: number;
  time: string;
  order_status: string,
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

// Container for the job offer
const JobOfferContainer = styled.View`
  width: 100%;
  padding: 15px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
`;

// Styled component for job details
const JobDetail = styled.View`
  margin-bottom: 8px;
  flex-direction: row;
`;

// Styled component for detail label
const Label = styled.Text`
  font-weight: bold;
  color: #333;
  min-width: 120px;
`;

// Styled component for job data
const Value = styled.Text`
  color: #666;
  flex: 1;
`;

// Container for action buttons
const ActionsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 15px;
`;

// Styled button for accept and decline
const ActionButton = styled(TouchableOpacity)<{ actionType: 'accept' | 'decline' }>`
  flex: 1;
  padding: 12px;
  margin: 0 5px;
  border-radius: 5px;
  align-items: center;
  background-color: ${({ actionType }) => (actionType === 'accept' ? '#4CAF50' : '#F44336')};
`;

// Expand/Collapse Button
const ExpandButton = styled(TouchableOpacity)`
  align-self: flex-end;
  margin-top: 10px;
  background-color: #007bff;
  padding: 8px 12px;
  border-radius: 5px;
`;

const ExpandButtonText = styled.Text`
  color: white;
  font-size: 14px;
`;

const ButtonText = styled.Text`
  color: white;
  font-weight: bold;
`;

const JobOfferComponent: React.FC<JobOfferProps> = ({
  id,
  orderNumber,
  orderMode,
  destination,
  pickupLocation,
  price,
  time,
  order_status,
  onAccept,
  onDecline,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <JobOfferContainer>
      <JobDetail>
        <Label>Order Number:</Label>
        <Value>{orderNumber}</Value>
      </JobDetail>
      
      <JobDetail>
        <Label>Price:</Label>
        <Value>€{price.toFixed(2)}</Value>
      </JobDetail>
      {order_status == "ACCEPTED" ? 
      <>
        <Label>STATUS:</Label>
        <Value>Accepted, check Current order's page</Value>
      </> : null
    }

      {isExpanded && (
        <>
          <JobDetail>
            <Label>Order Mode:</Label>
            <Value>{orderMode}</Value>
          </JobDetail>

          <JobDetail>
            <Label>Pickup Location:</Label>
            <Value>{pickupLocation}</Value>
          </JobDetail>

          <JobDetail>
            <Label>Destination:</Label>
            <Value>{destination}</Value>
          </JobDetail>

          <JobDetail>
            <Label>Time:</Label>
            <Value>{time}</Value>
          </JobDetail>

        {order_status == "ACCEPTED" ? <Text>
          This is ongoing order.
        </Text> : 
          <ActionsContainer>
          <ActionButton 
            actionType="accept" 
            onPress={() => onAccept(id)}
          >
            <ButtonText>Accept</ButtonText>
          </ActionButton>
          <ActionButton 
            actionType="decline" 
            onPress={() => onDecline(id)}
          >
            <ButtonText>Decline</ButtonText>
          </ActionButton>
        </ActionsContainer>
        
        }
        </>
      )}

      <ExpandButton onPress={toggleExpand}>
        <ExpandButtonText>
          {isExpanded ? 'Collapse' : 'Expand'}
        </ExpandButtonText>
      </ExpandButton>
    </JobOfferContainer>
  );
};

export default JobOfferComponent;