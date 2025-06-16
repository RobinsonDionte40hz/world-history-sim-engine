import React from 'react';
import { Card } from '../common';

export default function CharacterTabInfo() {
  return (
    <Card className="mb-4">
      <h3>What are Character Types?</h3>
      <p>
        Character Types define the roles or archetypes in your world. You can connect them to interactions to control who can perform certain actions.<br />
        <strong>Tip:</strong> Use colors to visually distinguish types!<br />
        <br />
        <strong>How to connect:</strong> When creating or editing an interaction, select a Character Type to specify who can perform it.
      </p>
    </Card>
  );
} 